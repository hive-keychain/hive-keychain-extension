const { sources, WebpackError } = require('webpack');
const { PAGE_WORLD_ENTRY_NAMES } = require('../lavamoat');

// addons-linter refuses to parse a JavaScript file larger than 5MB.
const FIREFOX_AMO_MAX_JS_BYTES = 5 * 1024 * 1024;
// Webpack measures chunks before LavaMoat prepends the SES lockdown (~0.5MB).
const FIREFOX_JS_MAX_CHUNK_BYTES = 3 * 1024 * 1024;

const PAGE_WORLD_ENTRIES = new Set(PAGE_WORLD_ENTRY_NAMES);

const HTML_ENTRY_POINTS = {
  'popup.html': 'popup',
  'sidepanel.html': 'popup',
  'detached_window.html': 'popup',
  'portfolio.html': 'portfolio',
  'dialog.html': 'dialog',
  'peak-open-notifications-config.html': 'peakdNotificationsConfig',
  'import-preferences.html': 'importSettings',
  'import-accounts.html': 'importAccounts',
  'multisig-dialog.html': 'multisigDialog',
  'vault.html': 'vault',
};

const isSplittableChunk = (chunk) => {
  if (PAGE_WORLD_ENTRIES.has(chunk.name)) {
    return false;
  }
  if (!chunk.groupsIterable) {
    return true;
  }
  for (const group of chunk.groupsIterable) {
    if (PAGE_WORLD_ENTRIES.has(group.name)) {
      return false;
    }
  }
  return true;
};

const orderedChunkFiles = (chunks, entryChunk) => {
  const rest = [];
  const entryFiles = [];
  const seen = new Set();
  chunks.forEach((chunk) => {
    const bucket = chunk === entryChunk ? entryFiles : rest;
    chunk.files.forEach((file) => {
      if (!file.endsWith('.js') || seen.has(file)) {
        return;
      }
      seen.add(file);
      bucket.push(file);
    });
  });
  return [...rest, ...entryFiles];
};

const orderedPageScripts = (entriesFromParentToChild) => {
  const ordered = [];
  const seen = new Set();
  entriesFromParentToChild.forEach(({ chunks, entryChunk }) => {
    orderedChunkFiles(chunks, entryChunk).forEach((file) => {
      if (seen.has(file)) {
        return;
      }
      seen.add(file);
      ordered.push(file);
    });
  });
  return ordered;
};

const collectEntrypoints = (entrypoint, collected = [], seen = new Set()) => {
  if (seen.has(entrypoint)) {
    return collected;
  }
  seen.add(entrypoint);
  entrypoint._dependOn.forEach((parent) => {
    collectEntrypoints(parent, collected, seen);
  });
  collected.push(entrypoint);
  return collected;
};

const scriptsForEntrypoint = (entrypoint) =>
  orderedPageScripts(
    collectEntrypoints(entrypoint).map((entry) => ({
      chunks: entry.chunks,
      entryChunk: entry.getEntrypointChunk(),
    })),
  );

const rewriteHtmlScriptTags = (html, orderedFiles, entryNames = []) => {
  const scriptRe = /<script src="([^"]+)"><\/script>/g;
  const matches = [...html.matchAll(scriptRe)];
  const wanted = new Set([
    ...orderedFiles,
    ...entryNames.map((entryName) => `${entryName}Bundle.js`),
  ]);
  const existing = matches.filter((match) =>
    wanted.has(match[1].replace(/^\//, '')),
  );
  if (existing.length === 0) {
    return html;
  }
  const prefix = existing[0][1].startsWith('/') ? '/' : '';
  const replacement = orderedFiles
    .map((file) => `<script src="${prefix}${file}"></script>`)
    .join('\n    ');
  let nextHtml = html;
  existing
    .slice(1)
    .reverse()
    .forEach((match) => {
      const lineStart = nextHtml.lastIndexOf('\n', match.index);
      const gap = nextHtml.slice(lineStart, match.index);
      const from = /^\n[ \t]*$/.test(gap) ? lineStart : match.index;
      nextHtml =
        nextHtml.slice(0, from) +
        nextHtml.slice(match.index + match[0].length);
    });
  return nextHtml.replace(existing[0][0], replacement);
};

const expandContentScriptFiles = (jsFiles, resolveEntryFiles) => {
  const expanded = [];
  const seen = new Set();
  jsFiles.forEach((file) => {
    const entryName = file.endsWith('Bundle.js')
      ? file.slice(0, -'Bundle.js'.length)
      : null;
    const resolved = entryName ? resolveEntryFiles(entryName) : null;
    const files = resolved && resolved.length > 0 ? resolved : [file];
    files.forEach((item) => {
      if (seen.has(item)) {
        return;
      }
      seen.add(item);
      expanded.push(item);
    });
  });
  return expanded;
};

const ownEntrypointScripts = (entrypoint) =>
  orderedChunkFiles(entrypoint.chunks, entrypoint.getEntrypointChunk());

class FirefoxAmoBundleSizePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'FirefoxAmoBundleSizePlugin',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'FirefoxAmoBundleSizePlugin',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            this.rewriteHtml(compilation);
            this.rewriteManifest(compilation);
            this.reportOversizedScripts(compilation);
          },
        );
      },
    );
  }

  rewriteHtml(compilation) {
    Object.entries(HTML_ENTRY_POINTS).forEach(([filename, entryName]) => {
      const asset = compilation.getAsset(filename);
      const entrypoint = compilation.entrypoints.get(entryName);
      if (!asset || !entrypoint) {
        return;
      }
      const html = asset.source.source().toString();
      const entrypoints = collectEntrypoints(entrypoint);
      const nextHtml = rewriteHtmlScriptTags(
        html,
        scriptsForEntrypoint(entrypoint),
        entrypoints.map((entry) => entry.name),
      );
      if (nextHtml !== html) {
        compilation.updateAsset(filename, new sources.RawSource(nextHtml));
      }
    });
  }

  rewriteManifest(compilation) {
    const asset = compilation.getAsset('manifest.json');
    if (!asset) {
      return;
    }
    const manifest = JSON.parse(asset.source.source().toString());
    const background = compilation.entrypoints.get('background');
    if (background && Array.isArray(manifest.background?.scripts)) {
      manifest.background.scripts = scriptsForEntrypoint(background);
    }
    if (Array.isArray(manifest.content_scripts)) {
      manifest.content_scripts = manifest.content_scripts.map((script) => {
        if (!Array.isArray(script.js)) {
          return script;
        }
        return {
          ...script,
          js: expandContentScriptFiles(script.js, (entryName) => {
            const entrypoint = compilation.entrypoints.get(entryName);
            if (!entrypoint) {
              return null;
            }
            return ownEntrypointScripts(entrypoint);
          }),
        };
      });
    }
    compilation.updateAsset(
      'manifest.json',
      new sources.RawSource(`${JSON.stringify(manifest, null, 2)}\n`),
    );
  }

  reportOversizedScripts(compilation) {
    compilation.getAssets().forEach((asset) => {
      if (!asset.name.endsWith('.js')) {
        return;
      }
      const size = asset.source.size();
      if (size <= FIREFOX_AMO_MAX_JS_BYTES) {
        return;
      }
      compilation.errors.push(
        new WebpackError(
          `${asset.name} is ${size} bytes. Firefox add-on validation rejects JavaScript files larger than 5MB.`,
        ),
      );
    });
  }
}

module.exports = {
  FIREFOX_AMO_MAX_JS_BYTES,
  FIREFOX_JS_MAX_CHUNK_BYTES,
  HTML_ENTRY_POINTS,
  isSplittableChunk,
  orderedChunkFiles,
  orderedPageScripts,
  rewriteHtmlScriptTags,
  expandContentScriptFiles,
  FirefoxAmoBundleSizePlugin,
};
