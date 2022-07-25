import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import currencies from 'src/__tests__/utils-for-testing/data/currencies';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import { KeyChainApiGetCustomData } from 'src/__tests__/utils-for-testing/interfaces/implementations';
import { GetManifest } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const manifestFile = {
  chromium: require('../../../../manifests/chromium/manifest.json'),
};
const messagesJsonFile = require('public/_locales/en/messages.json');
/**
 *
 * @param args
 * @param args[0] Is always used for the LocalStorageKeyEnum.
 * @param args[1] If need to return specific data.
 * @returns Null if not found or not mocked.
 * If debug needed, just uncomment the console.log after the default case.
 */
const getValuefromLS = (...args: any[]): any => {
  let data = null;
  data = args[1];
  //to remove
  if (data) {
    console.log('Calling getValuefromLS with: ', args);
  }
  //end to remove
  switch (args[0]) {
    case LocalStorageKeyEnum.AUTOLOCK:
      return (
        data ?? {
          type: AutoLockType.DEFAULT,
          mn: 1,
        }
      );
    case LocalStorageKeyEnum.SWITCH_RPC_AUTO:
      return data ?? true;
    case LocalStorageKeyEnum.WALLET_HISTORY_FILTERS:
      return data ?? null;
    case LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY:
      return data ?? { 'keychain.tests': true };
    case LocalStorageKeyEnum.FAVORITE_USERS:
      return data ?? { 'keychain.tests': ['one1', 'two2', 'three3'] };
    case LocalStorageKeyEnum.LAST_VERSION_UPDATE:
      return data ?? manifestFile.chromium.version;
    case LocalStorageKeyEnum.HIDDEN_TOKENS:
      return data ?? [];
    case LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API:
      return data ?? [];
    default:
      //Cases not being handled yet:
      // - HIVE_ENGINE_ACTIVE_CONFIG
      // - HIVE_ENGINE_CUSTOM_RPC_LIST
      // - __REQUEST_HANDLER
      // - LOCAL_STORAGE_VERSION

      //console.log('Not handled and being called by: ', args[0]);
      return undefined;
  }
};

const i18nGetMessage = (message: string) => {
  if (messagesJsonFile[message]) {
    return messagesJsonFile[message].message;
  }
  return message + ' check as not found on jsonFile.';
};

const withOptions = (message: string, options?: string[]) => {
  if (options && options.length) {
    let str = message;
    for (const [key, value] of Object.entries(options)) {
      str = str.replace(`$${+key + 1}`, value);
    }
    return str;
  } else {
    return message;
  }
};

const i18nGetMessageCustom = (message: string, options?: string[]) => {
  if (messagesJsonFile[message]) {
    return withOptions(messagesJsonFile[message].message, options);
  }
  return message + ' check as not found on jsonFile.';
};
/**
 * Note:
 *  witnessRanking: witness Ranking.
 * currenciesPrices: CurrencyPricesUtils.getPrices.
 * rpc: HiveUtils.setRpc.
 * phishingAccounts: getPhishingAccounts.
 * extensionVersion: VersionLogUtils.getLastVersion.
 * delegators: HiveUtils.getDelegators.
 */
const keychainApiGet = async (
  urlToGet: string,
  customData?: KeyChainApiGetCustomData,
): Promise<any> => {
  switch (true) {
    case urlToGet === '/hive/v2/witnesses-ranks':
      return customData?.witnessRanking ?? witness.ranking;
    case urlToGet === '/hive/v2/price':
      return customData?.currenciesPrices ?? currencies.prices;
    case urlToGet === '/hive/rpc':
      return customData?.rpc ?? { data: { rpc: 'https://api.hive.blog' } };
    case urlToGet === '/hive/phishingAccounts':
      return customData?.phishingAccounts ?? phishing.accounts;
    case urlToGet === '/hive/last-extension-version':
      return (
        customData?.extensionVersion ?? {
          data: {
            version: manifestFile.chromium.version,
            name: manifestFile.chromium.name,
          } as GetManifest,
        }
      );
    case urlToGet.includes('/hive/delegators/'):
      return customData?.delegators ?? { data: delegations.delegators };
    default:
      return 'Please check on default cases as not found condition ->/implementations/...';
  }
};

const mocksImplementation = {
  getValuefromLS,
  i18nGetMessage,
  i18nGetMessageCustom,
  keychainApiGet,
};

export default mocksImplementation;
