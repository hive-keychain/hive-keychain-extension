const path = require('path');
const fs = require('fs');

const {
  FIREFOX_AMO_MAX_JS_BYTES,
  FIREFOX_JS_MAX_CHUNK_BYTES,
  isSplittableChunk,
  orderedChunkFiles,
  orderedPageScripts,
  rewriteHtmlScriptTags,
  expandContentScriptFiles,
} = require('../../../webpack/firefox/firefox-amo-bundle-size');

describe('Firefox add-on bundle size', () => {
  const entryChunk = { files: ['dialogBundle.js'] };
  const splitChunk = { files: ['812Bundle.js', '812Bundle.js.LICENSE.txt'] };

  it('keeps the webpack max chunk size under the 5MB parser limit', () => {
    expect(FIREFOX_JS_MAX_CHUNK_BYTES).toBeLessThan(FIREFOX_AMO_MAX_JS_BYTES);
  });

  it('loads split chunks before the entry chunk that starts the page', () => {
    expect(orderedChunkFiles([entryChunk, splitChunk], entryChunk)).toEqual([
      '812Bundle.js',
      'dialogBundle.js',
    ]);
  });

  it('loads parent runtimes before dependent page scripts', () => {
    const hiveTx = { files: ['hiveTxBundle.js'] };
    const extensionSplit = { files: ['204Bundle.js'] };
    const extensionApp = { files: ['extensionAppBundle.js'] };

    expect(
      orderedPageScripts([
        { chunks: [hiveTx], entryChunk: hiveTx },
        {
          chunks: [extensionSplit, extensionApp],
          entryChunk: extensionApp,
        },
      ]),
    ).toEqual([
      'hiveTxBundle.js',
      '204Bundle.js',
      'extensionAppBundle.js',
    ]);
  });

  it('rewrites extension pages without dropping unrelated scripts', () => {
    const html = [
      '<script src="popup-preload.js"></script>',
      '<script src="hiveTxBundle.js"></script>',
      '<script src="extensionAppBundle.js"></script>',
      '<script src="popupBundle.js"></script>',
      '<script src="assets/extra-styles/sidepanel.js"></script>',
    ].join('\n    ');

    expect(
      rewriteHtmlScriptTags(html, [
        'hiveTxBundle.js',
        '204Bundle.js',
        'extensionAppBundle.js',
        'popupBundle.js',
      ]),
    ).toBe(
      [
        '<script src="popup-preload.js"></script>',
        '<script src="hiveTxBundle.js"></script>',
        '<script src="204Bundle.js"></script>',
        '<script src="extensionAppBundle.js"></script>',
        '<script src="popupBundle.js"></script>',
        '<script src="assets/extra-styles/sidepanel.js"></script>',
      ].join('\n    '),
    );
  });

  it('drops the original entry tag when that chunk is renamed', () => {
    const html = [
      '<script src="hiveTxBundle.js"></script>',
      '<script src="extensionAppBundle.js"></script>',
      '<script src="popupBundle.js"></script>',
    ].join('\n    ');

    expect(
      rewriteHtmlScriptTags(
        html,
        [
          'hiveTxBundle.js',
          'extensionApp-7bd12ddeBundle.js',
          'popupBundle.js',
        ],
        ['hiveTx', 'extensionApp', 'popup'],
      ),
    ).toBe(
      [
        '<script src="hiveTxBundle.js"></script>',
        '<script src="extensionApp-7bd12ddeBundle.js"></script>',
        '<script src="popupBundle.js"></script>',
      ].join('\n    '),
    );
  });

  it('keeps the leading slash used by extension pages', () => {
    expect(
      rewriteHtmlScriptTags('<script src="/dialogBundle.js"></script>', [
        '812Bundle.js',
        'dialogBundle.js',
      ]),
    ).toBe(
      [
        '<script src="/812Bundle.js"></script>',
        '<script src="/dialogBundle.js"></script>',
      ].join('\n    '),
    );
  });

  it('expands content scripts with the split files that belong to that entry', () => {
    const resolveEntryFiles = (entryName: string) => {
      if (entryName === 'evmContentScript') {
        return ['440Bundle.js', 'evmContentScriptBundle.js'];
      }
      return null;
    };

    expect(
      expandContentScriptFiles(
        ['web_interfaceBundle.js', 'keychainifyBundle.js'],
        resolveEntryFiles,
      ),
    ).toEqual(['web_interfaceBundle.js', 'keychainifyBundle.js']);
    expect(
      expandContentScriptFiles(['evmContentScriptBundle.js'], resolveEntryFiles),
    ).toEqual(['440Bundle.js', 'evmContentScriptBundle.js']);
  });

  it('leaves page-world bundles as one file', () => {
    expect(isSplittableChunk({ name: 'evmKeychainProvider' })).toBe(false);
    expect(
      isSplittableChunk({
        name: undefined,
        groupsIterable: [{ name: 'popup' }, { name: 'evmKeychainProvider' }],
      }),
    ).toBe(false);
    expect(
      isSplittableChunk({
        name: 'dialog',
        groupsIterable: [{ name: 'dialog' }],
      }),
    ).toBe(true);
  });

  it('splits Firefox production bundles and leaves Chromium production bundles whole', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const firefox = require(path.join(
      repoRoot,
      'webpack/firefox/webpack.prod.js',
    ));
    const chromium = require(path.join(
      repoRoot,
      'webpack/chromium/webpack.prod.js',
    ));

    expect(firefox.optimization.concatenateModules).toBe(false);
    expect(firefox.optimization.splitChunks.maxSize).toBe(
      FIREFOX_JS_MAX_CHUNK_BYTES,
    );
    expect(firefox.optimization.splitChunks.chunks).toBe(isSplittableChunk);
    expect(
      firefox.plugins.some(
        (plugin: { constructor: { name: string } }) =>
          plugin?.constructor?.name === 'FirefoxAmoBundleSizePlugin',
      ),
    ).toBe(true);
    expect(chromium.optimization?.splitChunks?.maxSize).toBeUndefined();
  });

  it('declares the Firefox add-on id with browser_specific_settings', () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../../../manifests/firefox/manifest.json'),
        'utf8',
      ),
    );

    expect(manifest.applications).toBeUndefined();
    expect(manifest.browser_specific_settings.gecko.id).toBe(
      '{b6bd7e35-0762-42a2-a283-95a94635047d}',
    );
  });
});
