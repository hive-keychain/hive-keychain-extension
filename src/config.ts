import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RampConfig } from '@interfaces/ramps.interface';
import { SwapCryptosConfig } from '@interfaces/swap-cryptos.interface';

const Config = {
  hiveEngine: {
    mainnet: 'ssc-mainnet-hive',
    accountHistoryApi: 'https://history.hive-engine.com/',
    rpc: 'https://api.hive-engine.com/rpc',
  } as HiveEngineConfig,
  claims: {
    FREQUENCY: +(process.env.DEV_CLAIM_FREQUENCY || 10),
    freeAccount: {
      MIN_RC_PCT: +(process.env.DEV_CLAIM_ACCOUNT_RC_PCT || 85),
      MIN_RC: +(process.env.DEV_CLAIM_ACCOUNT_MIN_RC || 9484331370472),
    },
    savings: {
      delay: +(process.env.DEV_CLAIM_SAVINGS_DELAY || 30),
    },
  },
  analytics: {
    frequency: +(process.env.DEV_ANALYTICS_FREQUENCY || 10),
  },
  KEYCHAIN_PROPOSAL: 262,
  PROPOSAL_MIN_VOTE_DIFFERENCE_HIDE_POPUP: 8 * 10 ** 6,
  MIN_LOADING_TIME: 1000,
  rpc: {
    DEFAULT: { uri: 'https://api.hive.blog', testnet: false },
  },
  governanceReminderDelayInSeconds: 30 * 24 * 3600, //days
  loader: {
    minDuration: process.env.NODE_ENV === 'test' ? 0 : 1000,
  },
  transactions: {
    expirationTimeInMinutes: 10,
  },
  swaps: {
    autoRefreshPeriodSec: +(process.env.DEV_SWAP_AUTO_REFRESH ?? 30),
    autoRefreshHistoryPeriodSec: +(process.env.DEV_SWAP_AUTO_REFRESH ?? 10),
    baseURL:
      process.env.KEYCHAIN_SWAP_API_DEV === 'true'
        ? 'http://localhost:5050'
        : 'https://swap.hive-keychain.com',
  },
  witnesses: {
    feedWarningLimitInHours: 5,
  },
  ramps: {
    autoRefreshPeriodSec: 30,
    transak: {
      baseUrl: 'https://api.transak.com',
      apiKey:
        process.env.TRANSAK_DEV_API_KEY ||
        '716078e4-939c-445a-8c6d-534614cd31b1',
    } as RampConfig,
    ramp: {
      baseUrl: process.env.RAMP_DEV_API_KEY
        ? 'https://api.demo.ramp.network'
        : 'https://api.ramp.network',
      apiKey: process.env.RAMP_DEV_API_KEY || '',
    } as RampConfig,
  },
  swapCryptos: {
    autoRefreshPeriodSec: 30,
    stealthex: {
      //TODO add keychain data
      urls: {
        baseUrl: 'https://api.stealthex.io/api/v2/',
        referalBaseUrl: 'https://stealthex.io/?ref=',
        routes: {
          allCurrencies: 'fee/currency',
          currencyPair: 'fee/pairs/',
          minMaxAccepted: 'fee/range/',
          estimation: 'fee/estimate/',
        },
      },
      apiKey: process.env.STEALHEX_DEV_API_KEY || '',
      headerKey: 'X-SX-API-KEY',
      refId: 'ldJCcGZA9H',
      partnerFeeAmount: 20,
    } as SwapCryptosConfig,
    simpleswap: {
      urls: {
        baseUrl: 'https://api.simpleswap.io/',
        referalBaseUrl: 'https://simpleswap.io/?ref=',
        routes: {
          allCurrencies: 'get_all_currencies',
          currencyPair: 'get_pairs',
          minMaxAccepted: 'get_ranges',
          estimation: 'get_estimated',
        },
      },
      apiKey: process.env.SIMPLESWAP_DEV_API_KEY ?? '',
      headerKey: '',
      refId: 'a81a6051c500',
      //Note: fee is set in the website.
    } as SwapCryptosConfig,
  },
  multisig: {
    baseURL:
      process.env.MULTISIG_BACKEND_SERVER ||
      'https://api-multisig.hive-keychain.com',
  },
};

export default Config;
