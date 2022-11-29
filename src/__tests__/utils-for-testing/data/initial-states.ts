import { LocalAccount } from '@interfaces/local-account.interface';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
/**
 * mk user one, accounts: []
 */
const iniState = {
  mk: mk.user.one,
  accounts: [] as LocalAccount[],
} as RootState;

const iniStateAs = {
  defaultExistent: {
    mk: mk.user.one,
    accounts: accounts.twoAccounts,
  } as RootState,
  defaultExistentAllKeys: {
    mk: mk.user.one,
    accounts: [accounts.local.oneAllkeys, accounts.local.two],
  },
  emptyState: {} as RootState,
};

export default { iniState, iniStateAs };
