import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { AutoLockType } from '@interfaces/autolock.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import currencies from 'src/__tests__/utils-for-testing/data/currencies';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import { KeyChainApiGetCustomData } from 'src/__tests__/utils-for-testing/interfaces/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import { DEFAULT_FILTER } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history.component';
import { WhatsNewContent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.interface';

const manifestFile = {
  chromium: require('../../../../manifests/chromium/manifest.json'),
};
const messagesJsonFile = require('public/_locales/en/messages.json');

const hasKeys = (obj: {}) => {
  return Object.keys(obj).length > 0;
};
/**
 *
 * @param args
 * @param args[0] Is always used for the LocalStorageKeyEnum.
 * @param customData Used to pass custom readed value from LS. To use, assign dataMocks.customDataFromLocalStorage
 * @returns Undefined if not found or not mocked yet. Enable console.log in default case, to see which key is not being mocked.
 * If debug needed, just uncomment the console.log
 */
const getValuefromLS = async (...args: any[]): Promise<any> => {
  let customData: CustomDataFromLocalStorage = args[1] ?? {};
  // console.log('being called with: ', args[0], customData);
  switch (args[0]) {
    case LocalStorageKeyEnum.AUTOLOCK:
      return customData.hasOwnProperty('customAutolock')
        ? customData.customAutolock
        : {
            type: AutoLockType.DEFAULT,
            mn: 1,
          };
    case LocalStorageKeyEnum.SWITCH_RPC_AUTO:
      return customData.hasOwnProperty('customSwitchAuto')
        ? customData.customSwitchAuto
        : true;
    case LocalStorageKeyEnum.WALLET_HISTORY_FILTERS:
      return customData.hasOwnProperty('customWalletHistoryFilters')
        ? customData.customWalletHistoryFilters
        : DEFAULT_FILTER;
    case LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY:
      return customData.hasOwnProperty('customHideSuggestionProxy')
        ? customData.customHideSuggestionProxy
        : { 'keychain.tests': true };
    case LocalStorageKeyEnum.FAVORITE_USERS:
      return customData.hasOwnProperty('customFavoriteUsers')
        ? customData.customFavoriteUsers
        : { 'keychain.tests': ['one1', 'two2', 'three3'] };
    case LocalStorageKeyEnum.LAST_VERSION_UPDATE:
      return customData.hasOwnProperty('customlastVersionSeen')
        ? customData.customlastVersionSeen
        : manifestFile.chromium.version;
    case LocalStorageKeyEnum.HIDDEN_TOKENS:
      return customData.hasOwnProperty('customHiddenTokenList')
        ? customData.customHiddenTokenList
        : [];
    case LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API:
      return customData.hasOwnProperty('accountHistoryApi')
        ? customData.accountHistoryApi
        : [];
    case LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST:
      return customData.hasOwnProperty('customRpcList')
        ? customData.customRpcList
        : [];
    case LocalStorageKeyEnum.KEYCHAINIFY_ENABLED:
      return customData.hasOwnProperty('customKeychainifyEnabled')
        ? customData.customKeychainifyEnabled
        : true;
    case LocalStorageKeyEnum.RPC_LIST:
      return customData.hasOwnProperty('customsRpcs')
        ? customData.customsRpcs
        : [];
    case LocalStorageKeyEnum.NO_CONFIRM:
      return customData.hasOwnProperty('customAuthorizedOP')
        ? customData.customAuthorizedOP
        : ({} as NoConfirm);
    case LocalStorageKeyEnum.LOCAL_STORAGE_VERSION:
      return customData.hasOwnProperty('customStorageVersion')
        ? customData.customStorageVersion
        : undefined;
    case LocalStorageKeyEnum.CURRENT_RPC:
      return customData.hasOwnProperty('customCurrentRpc')
        ? customData.customCurrentRpc
        : undefined;
    case LocalStorageKeyEnum.__MK:
      return customData.hasOwnProperty('customMK')
        ? customData.customMK
        : undefined;
    case LocalStorageKeyEnum.ACCOUNTS:
      return customData.hasOwnProperty('customAccounts')
        ? customData.customAccounts
        : undefined;
    default:
      //Cases not being handled yet:
      // - HIVE_ENGINE_ACTIVE_CONFIG
      // - __REQUEST_HANDLER

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
  return message; // + ' check as not found on jsonFile.';
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
  // console.log({ customData });
  switch (true) {
    case urlToGet === 'hive/v2/witnesses-ranks':
      return customData?.witnessRanking ?? witness.ranking;
    case urlToGet === 'hive/v2/price':
      return customData?.currenciesPrices ?? currencies.prices;
    case urlToGet === 'hive/rpc':
      return customData?.rpc ?? { rpc: 'https://api.hive.blog' };
    case urlToGet === 'hive/phishingAccounts':
      return customData?.phishingAccounts ?? phishing.accounts;
    case urlToGet === 'hive/last-extension-version':
      return (
        customData?.extensionVersion ??
        ({
          version: manifestFile.chromium.version, //by default same version as current
          //name: manifestFile.chromium.name,
          features: {},
          url: 'https://hive-keychain.com',
        } as WhatsNewContent)
      );
    case urlToGet.includes('hive/delegators/'):
      return customData?.delegators ?? delegations.delegators;
    default:
      return 'Please check on default cases as not found condition ->/implementations/...';
  }
};

const hiveTxUtils = {
  getData: (toUse: {
    conversionRequests?: any;
    collateralized?: any;
    listProposals?: any;
    listProposalVotes?: any;
    dynamicGlobalProperties?: any;
  }) => {
    HiveTxUtils.getData = jest.fn().mockImplementation((...args) => {
      switch (args[0]) {
        case 'condenser_api.get_conversion_requests':
          return Promise.resolve(toUse.conversionRequests);
        case 'condenser_api.get_collateralized_conversion_requests':
          return Promise.resolve(toUse.collateralized);
        case 'condenser_api.list_proposals':
          return Promise.resolve(toUse.listProposals);
        case 'condenser_api.list_proposal_votes':
          return Promise.resolve(toUse.listProposalVotes);
        case 'condenser_api.get_dynamic_global_properties':
          return Promise.resolve(toUse.dynamicGlobalProperties);
        default:
          return Promise.resolve('Please check data assignment!');
      }
    });
  },
};

/**
 * Note: for now this mock is related to
 * @hiveapp/utils/currency-prices.utils.ts
 * > getBittrexCurrency
 */
const mockFetch = (data: any, status: number, reject?: boolean) => {
  jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
    reject
      ? Promise.reject(data)
      : Promise.resolve({
          json: () => Promise.resolve(data),
          status: status,
        } as Response),
  );
};

const mocksImplementation = {
  getValuefromLS,
  i18nGetMessage,
  i18nGetMessageCustom,
  keychainApiGet,
  manifestFile,
  hiveTxUtils,
  mockFetch,
};

export default mocksImplementation;
