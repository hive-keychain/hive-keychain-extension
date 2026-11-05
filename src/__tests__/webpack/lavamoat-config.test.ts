const path = require('path');

describe('lavamoat webpack config', () => {
  const originalFlag = process.env.LAVAMOAT;

  const restoreFlag = () => {
    if (originalFlag === undefined) {
      delete process.env.LAVAMOAT;
      return;
    }
    process.env.LAVAMOAT = originalFlag;
  };

  const loadConfig = (flag, configPath) => {
    jest.resetModules();
    if (flag === undefined) {
      delete process.env.LAVAMOAT;
    } else {
      process.env.LAVAMOAT = flag;
    }
    return require(configPath);
  };

  const findLavaMoatPlugin = (config) =>
    config.plugins.find(
      (plugin) => plugin?.constructor?.name === 'LavaMoatPlugin',
    );

  afterEach(() => {
    restoreFlag();
    jest.resetModules();
  });

  it('keeps production builds unprotected unless LAVAMOAT=1', () => {
    const config = loadConfig(
      undefined,
      path.join(__dirname, '../../../webpack/chromium/webpack.prod.js'),
    );

    expect(findLavaMoatPlugin(config)).toBeUndefined();
    expect(config.entry.popup).toBeDefined();
    expect(config.entry.evmKeychainProvider).toBeDefined();
    expect(config.entry.hiveTx).toBeDefined();
  });

  it('protects extension entries and leaves page-world entries out when enabled', () => {
    const chromium = loadConfig(
      '1',
      path.join(__dirname, '../../../webpack/chromium/webpack.prod.js'),
    );
    const firefox = loadConfig(
      '1',
      path.join(__dirname, '../../../webpack/firefox/webpack.prod.js'),
    );
    const beta = loadConfig(
      '1',
      path.join(__dirname, '../../../webpack/chromium/webpack.beta.js'),
    );

    [chromium, firefox, beta].forEach((config) => {
      expect(config.entry.popup).toBeDefined();
      expect(config.entry.hiveTx.dependOn).toBeUndefined();
      expect(config.entry.extensionApp.dependOn).toBe('hiveTx');
      expect(config.entry.evmKeychainProvider).toBeUndefined();
      expect(config.entry.evmKeychainLegacyPreferred).toBeUndefined();
      expect(config.entry.evmKeychainLegacyYielding).toBeUndefined();
    });

    const chromiumPlugin = findLavaMoatPlugin(chromium);
    const firefoxPlugin = findLavaMoatPlugin(firefox);
    const betaPlugin = findLavaMoatPlugin(beta);

    expect(chromiumPlugin.options.policyLocation).toMatch(
      /webpack\/lavamoat\/chromium$/,
    );
    expect(betaPlugin.options.policyLocation).toBe(
      chromiumPlugin.options.policyLocation,
    );
    expect(firefoxPlugin.options.policyLocation).toMatch(
      /webpack\/lavamoat\/firefox$/,
    );
    expect(chromiumPlugin.options.scuttleGlobalThis).toEqual({
      enabled: false,
    });
    expect(chromiumPlugin.options.lockdown.consoleTaming).toBe('safe');
    expect(chromiumPlugin.options.lockdown.errorTaming).toBe('unsafe');
    expect(chromiumPlugin.options.lockdown.stackFiltering).toBe('verbose');
    expect(chromiumPlugin.options.generatePolicyOnly).toBeUndefined();
    expect(
      chromiumPlugin.options.generatePolicyIncludeOverrides,
    ).toBeUndefined();

    const scssRule = chromium.module.rules.find(
      (rule) => rule.test instanceof RegExp && rule.test.test('styles.scss'),
    );
    expect(
      scssRule.use.some((loader) => String(loader).includes('excludeLoader')),
    ).toBe(true);
  });

  it('builds page-world entries without LavaMoat, copying, or shared chunks', () => {
    const config = loadConfig(
      '1',
      path.join(__dirname, '../../../webpack/chromium/webpack.page-world.js'),
    );

    expect(Object.keys(config.entry).sort()).toEqual([
      'evmKeychainLegacyPreferred',
      'evmKeychainLegacyYielding',
      'evmKeychainProvider',
    ]);
    expect(config.output.filename).toBe('[name]Bundle.js');
    expect(
      config.plugins.some(
        (plugin) => plugin?.constructor?.name === 'CopyPlugin',
      ),
    ).toBe(false);
    expect(findLavaMoatPlugin(config)).toBeUndefined();
  });

  it('inlines lockdown only into the first bundle of each protected realm', () => {
    const { LOCKDOWN_BUNDLE_PATTERN } = loadConfig(
      undefined,
      path.join(__dirname, '../../../webpack/lavamoat/index.js'),
    );
    const prefixed = [
      'hiveTxBundle.js',
      'dialogBundle.js',
      'multisigDialogBundle.js',
      'peakdNotificationsConfigBundle.js',
      'importAccountsBundle.js',
      'importSettingsBundle.js',
      'vaultBundle.js',
      'backgroundBundle.js',
      'evmContentScriptBundle.js',
    ];
    const unprefixed = [
      'extensionAppBundle.js',
      'popupBundle.js',
      'portfolioBundle.js',
      'keychainifyBundle.js',
      'web_interfaceBundle.js',
      'evmKeychainProviderBundle.js',
      'evmKeychainLegacyPreferredBundle.js',
      'evmKeychainLegacyYieldingBundle.js',
    ];

    prefixed.forEach((fileName) => {
      expect(LOCKDOWN_BUNDLE_PATTERN.test(fileName)).toBe(true);
    });
    unprefixed.forEach((fileName) => {
      expect(LOCKDOWN_BUNDLE_PATTERN.test(fileName)).toBe(false);
    });
  });
});
