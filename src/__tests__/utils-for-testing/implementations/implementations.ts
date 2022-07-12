import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

const default_filters_wallet_history = {
  filterValue: '',
  inSelected: false,
  outSelected: false,
  selectedTransactionTypes: {
    transfer: false,
    claim_reward_balance: false,
    delegate_vesting_shares: false,
    claim_account: false,
    savings: false,
    power_up_down: false,
    convert: false,
  },
};

const messagesJsonFile = require('public/_locales/en/messages.json');
const getValuefromLS = (...args: any[]) => {
  switch (args[0]) {
    case LocalStorageKeyEnum.AUTOLOCK:
      return {
        type: AutoLockType.DEFAULT,
        mn: 1,
      };
    case LocalStorageKeyEnum.SWITCH_RPC_AUTO:
      return true;
    case LocalStorageKeyEnum.WALLET_HISTORY_FILTERS:
      return default_filters_wallet_history;
    case LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY:
      return { 'keychain.tests': true };
    case LocalStorageKeyEnum.FAVORITE_USERS:
      return { 'keychain.tests': ['one1', 'two2', 'three3'] };
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

const mocksImplementation = {
  getValuefromLS,
  i18nGetMessage,
  i18nGetMessageCustom,
  default_filters_wallet_history,
};

export default mocksImplementation;
