const fs = require('fs');
const path = require('path');
const { SES_LOCKDOWN_BANNER } = require('../webpack/lavamoat');

const LOCKDOWN_BUNDLES = [
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

const UNPREFIXED_BUNDLES = [
  'extensionAppBundle.js',
  'popupBundle.js',
  'portfolioBundle.js',
  'keychainifyBundle.js',
  'web_interfaceBundle.js',
];

const PAGE_WORLD_BUNDLES = [
  'evmKeychainProviderBundle.js',
  'evmKeychainLegacyPreferredBundle.js',
  'evmKeychainLegacyYieldingBundle.js',
];

const CONTENT_SCRIPT_DEPENDENT_BUNDLES = [
  'keychainifyBundle.js',
  'web_interfaceBundle.js',
];

const LAVAMOAT_RUNTIME_MARKER =
  'LavaMoatPlugin: runtime execution started without SES present';

const readBundle = (outputDir, fileName) => {
  const filePath = path.join(outputDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing bundle ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
};

const countBanner = (source) => source.split(SES_LOCKDOWN_BANNER).length - 1;

const outputDir = process.argv[2];

if (!outputDir) {
  console.error(
    'Usage: node scripts/check-lavamoat-bundles.js <output-directory>',
  );
  process.exit(1);
}

const resolvedOutputDir = path.resolve(outputDir);

LOCKDOWN_BUNDLES.forEach((fileName) => {
  const count = countBanner(readBundle(resolvedOutputDir, fileName));
  if (count !== 1) {
    throw new Error(
      `${fileName} should include the SES lockdown prefix once, found ${count}`,
    );
  }
});

UNPREFIXED_BUNDLES.forEach((fileName) => {
  const count = countBanner(readBundle(resolvedOutputDir, fileName));
  if (count !== 0) {
    throw new Error(
      `${fileName} should not include the SES lockdown prefix, found ${count}`,
    );
  }
});

CONTENT_SCRIPT_DEPENDENT_BUNDLES.forEach((fileName) => {
  const source = readBundle(resolvedOutputDir, fileName);
  if (source.includes(LAVAMOAT_RUNTIME_MARKER)) {
    throw new Error(
      `${fileName} must share the evmContentScript LavaMoat runtime`,
    );
  }
});

PAGE_WORLD_BUNDLES.forEach((fileName) => {
  const source = readBundle(resolvedOutputDir, fileName);
  if (countBanner(source) !== 0 || source.includes('LavaMoatPlugin:')) {
    throw new Error(
      `${fileName} is a page-world bundle and must not include SES or LavaMoat`,
    );
  }
});

const copiedProviderPath = path.join(resolvedOutputDir, 'hive_keychain.js');
if (!fs.existsSync(copiedProviderPath)) {
  throw new Error(`Missing copied provider ${copiedProviderPath}`);
}
const copiedProvider = fs.readFileSync(copiedProviderPath, 'utf8');
if (
  countBanner(copiedProvider) !== 0 ||
  copiedProvider.includes('LavaMoatPlugin:') ||
  !copiedProvider.includes('requestHandshake') ||
  !copiedProvider.includes('swHandshake_hive')
) {
  throw new Error(
    'hive_keychain.js must stay the copied Hive provider, without SES or LavaMoat',
  );
}

if (!fs.existsSync(path.join(resolvedOutputDir, 'manifest.json'))) {
  throw new Error(`Missing manifest.json in ${resolvedOutputDir}`);
}

const policyTarget = path.basename(resolvedOutputDir).includes('firefox')
  ? 'firefox'
  : 'chromium';
const generatedPolicy = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '../webpack/lavamoat',
      policyTarget,
      'policy.json',
    ),
    'utf8',
  ),
);
if (
  generatedPolicy.resources?.['@hiveio/hive-js>debug']?.globals?.chrome !== true
) {
  throw new Error(
    'policy.json should keep the generated debug chrome read. Denial belongs in policy-override.json.',
  );
}
const runtimeDebugPolicy = readBundle(
  resolvedOutputDir,
  'backgroundBundle.js',
).match(/"@hiveio\/hive-js>debug":\{globals:\{([^}]*)\}/);
if (
  !runtimeDebugPolicy ||
  !/(?:^|,)chrome:(?:!1|false)(?:,|\})/.test(runtimeDebugPolicy[1])
) {
  throw new Error(
    '@hiveio/hive-js>debug must not receive chrome in the runtime policy',
  );
}

console.log(`LavaMoat bundle boundaries hold in ${resolvedOutputDir}`);
