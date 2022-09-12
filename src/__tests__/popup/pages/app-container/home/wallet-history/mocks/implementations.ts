import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

const defautFilters = {
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

let copyFilters = { ...defautFilters };

const updateFilterToUse = (key: string) => {
  copyFilters = { ...defautFilters };
  copyFilters.selectedTransactionTypes = {
    ...copyFilters.selectedTransactionTypes,
    [key]: true,
  };
};

const getValueFilterfromLS = (...args: any[]) => {
  switch (args[0]) {
    case LocalStorageKeyEnum.AUTOLOCK:
      return {
        type: AutoLockType.DEFAULT,
        mn: 1,
      };
    case LocalStorageKeyEnum.SWITCH_RPC_AUTO:
      return true;
    case LocalStorageKeyEnum.WALLET_HISTORY_FILTERS:
      return copyFilters;
    case LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY:
      return { 'keychain.tests': true };
    case LocalStorageKeyEnum.FAVORITE_USERS:
      return { 'keychain.tests': ['one1', 'two2', 'three3'] };
  }
};

const implementationsWalletHistory = {
  getValueFilterfromLS,
  updateFilterToUse,
};

export default implementationsWalletHistory;
