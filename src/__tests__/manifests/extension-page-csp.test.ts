import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');

const extensionPagePolicy = [
  "script-src 'self'",
  "object-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
];

const manifestPaths = [
  'manifests/chromium/manifest.json',
  'manifests/chromium-beta/manifest.json',
  'manifests/firefox/manifest.json',
];

const pagesWithBundledFonts = [
  'public/popup.html',
  'public/sidepanel.html',
  'public/detached_window.html',
  'public/portfolio.html',
  'public/dialog.html',
  'public/multisig-dialog.html',
  'public/import-accounts.html',
  'public/import-preferences.html',
  'public/peak-open-notifications-config.html',
];

const googleFontHosts = [
  ['fonts', 'googleapis', 'com'].join('.'),
  ['fonts', 'gstatic', 'com'].join('.'),
];

const textExtensions = new Set([
  '.html',
  '.css',
  '.scss',
  '.ts',
  '.tsx',
  '.js',
  '.json',
]);

const getExtensionPagePolicy = (manifest: {
  content_security_policy?: string | { extension_pages?: string };
}): string => {
  const policy = manifest.content_security_policy;
  if (typeof policy === 'string') {
    return policy;
  }
  return policy?.extension_pages ?? '';
};

const splitDirectives = (policy: string): string[] =>
  policy
    .split(';')
    .map((directive) => directive.trim())
    .filter((directive) => directive.length > 0);

const collectTextFiles = (directory: string): string[] => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectTextFiles(fullPath);
    }
    return textExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
};

describe('extension page styles and fonts', () => {
  it('limits styles and fonts to the extension package', () => {
    for (const manifestPath of manifestPaths) {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(repoRoot, manifestPath), 'utf8'),
      );

      expect(splitDirectives(getExtensionPagePolicy(manifest))).toEqual(
        extensionPagePolicy,
      );
    }
  });

  it('does not reference remote Google font hosts', () => {
    const files = ['public', 'src'].flatMap((directory) =>
      collectTextFiles(path.join(repoRoot, directory)),
    );
    const matches = files.flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return googleFontHosts
        .filter((host) => text.includes(host))
        .map((host) => `${path.relative(repoRoot, file)} (${host})`);
    });

    expect(matches).toEqual([]);
  });

  it('serves text faces from packaged font files', () => {
    const fontDirectory = path.join(repoRoot, 'public/assets/fonts');
    const css = fs.readFileSync(
      path.join(fontDirectory, 'googleFonts.css'),
      'utf8',
    );
    const fontFiles = Array.from(
      css.matchAll(/url\('\.\/([^']+)'\)/g),
      (match) => match[1],
    );
    const missingFontFiles = fontFiles.filter(
      (file) => !fs.existsSync(path.join(fontDirectory, file)),
    );

    expect(fontFiles.length).toBeGreaterThan(0);
    expect(missingFontFiles).toEqual([]);

    for (const page of pagesWithBundledFonts) {
      const html = fs.readFileSync(path.join(repoRoot, page), 'utf8');
      expect(html).toContain('assets/fonts/googleFonts.css');
    }
  });
});
