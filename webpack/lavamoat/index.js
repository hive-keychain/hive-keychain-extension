const path = require('path');
const LavaMoatPlugin = require('@lavamoat/webpack');
const {
  LavaMoatStyleExclusionPlugin,
} = require('./style-exclusion');

// Browser checklist: webpack/lavamoat/SMOKE_TEST.md

const PAGE_WORLD_ENTRY_NAMES = [
  'evmKeychainProvider',
  'evmKeychainLegacyPreferred',
  'evmKeychainLegacyYielding',
];

const LOCKDOWN_BUNDLE_PATTERN =
  /^(hiveTx|dialog|multisigDialog|peakdNotificationsConfig|importAccounts|importSettings|vault|background|evmContentScript)Bundle\.js$/;

const SES_LOCKDOWN_BANNER =
  '/*! SES sources included by LavaMoat. Do not optimize or minify. */';

const LOCKDOWN_OPTIONS = {
  errorTaming: 'unsafe',
  stackFiltering: 'verbose',
  consoleTaming: 'safe',
  localeTaming: 'unsafe',
  overrideTaming: 'severe',
  errorTrapping: 'platform',
};

const SCUTTLE_GLOBAL_THIS = { enabled: false };

const isLavaMoatEnabled = () => process.env.LAVAMOAT === '1';

const policyDirectory = (target) => path.join(__dirname, target);

const withoutPageWorldEntries = (entry) => {
  const nextEntry = { ...entry };
  PAGE_WORLD_ENTRY_NAMES.forEach((name) => {
    delete nextEntry[name];
  });
  return nextEntry;
};

const pageWorldEntries = (entry) => {
  const nextEntry = {};
  PAGE_WORLD_ENTRY_NAMES.forEach((name) => {
    if (entry[name] === undefined) {
      throw new Error(`Missing page-world webpack entry "${name}"`);
    }
    nextEntry[name] = entry[name];
  });
  return nextEntry;
};

const excludeStyleModules = (rules) =>
  rules.map((rule) => {
    if (!(rule.test instanceof RegExp) || !rule.test.test('styles.scss')) {
      return rule;
    }
    const use = Array.isArray(rule.use)
      ? [...rule.use, LavaMoatPlugin.exclude]
      : rule.use;
    return { ...rule, use };
  });

const createLavaMoatPlugin = (target) =>
  new LavaMoatPlugin({
    policyLocation: policyDirectory(target),
    generatePolicy: process.env.LAVAMOAT_GENERATE_POLICY === 'true',
    readableResourceIds: true,
    scuttleGlobalThis: SCUTTLE_GLOBAL_THIS,
    inlineLockdown: LOCKDOWN_BUNDLE_PATTERN,
    lockdown: LOCKDOWN_OPTIONS,
  });

const applyLavaMoat = (webpackConfig, target) => {
  if (!isLavaMoatEnabled()) {
    return webpackConfig;
  }

  return {
    ...webpackConfig,
    entry: withoutPageWorldEntries(webpackConfig.entry),
    module: {
      ...webpackConfig.module,
      rules: [
        {
          test: /[\\/]bluebird[\\/]js[\\/](?:browser[\\/]bluebird(?:\.core)?\.js|release[\\/](?:errors|util)\.js)$/,
          loader: path.join(__dirname, 'bluebird-ses-loader.js'),
        },
        ...excludeStyleModules(webpackConfig.module.rules),
      ],
    },
    plugins: [
      ...webpackConfig.plugins,
      createLavaMoatPlugin(target),
      new LavaMoatStyleExclusionPlugin(),
    ],
  };
};

module.exports = {
  PAGE_WORLD_ENTRY_NAMES,
  LOCKDOWN_BUNDLE_PATTERN,
  SES_LOCKDOWN_BANNER,
  LOCKDOWN_OPTIONS,
  SCUTTLE_GLOBAL_THIS,
  isLavaMoatEnabled,
  policyDirectory,
  withoutPageWorldEntries,
  pageWorldEntries,
  applyLavaMoat,
};
