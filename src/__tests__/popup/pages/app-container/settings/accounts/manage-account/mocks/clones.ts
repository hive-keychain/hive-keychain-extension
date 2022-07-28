import { LocalAccount } from '@interfaces/local-account.interface';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
//TODO remove
//deep clones
const cloneState: RootState = JSON.parse(
  JSON.stringify(initialStates.iniStateAs.defaultExistentAllKeys),
);
const cloneAccounts: LocalAccount[] = JSON.parse(
  JSON.stringify([accounts.local.oneAllkeys, accounts.local.two]),
);

const clonesManageAccounts = {
  cloneState,
  cloneAccounts,
};

export default clonesManageAccounts;
