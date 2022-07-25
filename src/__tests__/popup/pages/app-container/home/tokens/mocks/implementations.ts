import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';

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

const justVissiblePAL = tokensUser.balances
  .filter((token) => token.symbol !== 'PAL')
  .map((hidden) => hidden.symbol);

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
    case LocalStorageKeyEnum.HIDDEN_TOKENS:
      return justVissiblePAL;
  }
};

const tokensImplementations = {
  getValuefromLS,
};

export default tokensImplementations;
