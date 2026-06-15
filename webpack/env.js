const dotenv = require('dotenv');

// Values in this list are compiled into browser extension bundles.
// Do not add release credentials, upload tokens, or private server secrets here.
const PUBLIC_ENV_KEYS = [
  'DEBUG_LOG',
  'DEV_CLAIM_ACCOUNT_MIN_RC',
  'DEV_CLAIM_ACCOUNT_RC_PCT',
  'DEV_CLAIM_FREQUENCY',
  'DEV_CLAIM_SAVINGS_DELAY',
  'DEV_SWAP_AUTO_REFRESH',
  'DEV_TUTORIAL',
  'DUPLICATE_REQUEST_EXPIRATION_TIME_IN_MINUTES',
  'EVM_DATA_EXPIRATION_TIME',
  'EVM_LIGHT_NODE_API_URL',
  'FORCED_EVM_WALLET_ADDRESS',
  'KEYCHAIN_API_URL',
  'KEYCHAIN_SWAP_API_DEV',
  'KEYLESS_HOST',
  'MULTISIG_BACKEND_SERVER',
  'PORTFOLIO_API_URL',
  'STOP_AUTOLOCK',
];

const loadedEnv = dotenv.config().parsed || {};

const stringifyDefineValue = (value) =>
  value === undefined ? 'undefined' : JSON.stringify(value);

const toDefinePluginEnv = (overrides = {}) => {
  const env = Object.fromEntries(
    Object.entries(overrides).map(([key, value]) => [
      `process.env.${key}`,
      stringifyDefineValue(value),
    ]),
  );

  return PUBLIC_ENV_KEYS.reduce((env, key) => {
    env[`process.env.${key}`] =
      key in loadedEnv ? stringifyDefineValue(loadedEnv[key]) : 'undefined';
    return env;
  }, env);
};

module.exports = {
  PUBLIC_ENV_KEYS,
  toDefinePluginEnv,
};
