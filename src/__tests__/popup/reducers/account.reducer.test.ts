import { Account, Authority } from '@hiveio/dhive';
import { ActionType } from '@popup/actions/action-type.enum';
import { AccountReducer } from '@popup/reducers/account.reducer';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('account.reducer tests:\n', () => {
  const username = utilsT.userData.username;
  const username2 = utilsT.userData2.username;
  const postingAuthority = {
    weight_threshold: 1,
    account_auths: [[utilsT.userData.encryptKeys.posting, 1]],
    key_auths: [[`@${username}`, 1]],
  } as Authority;
  const activeAuthority = {
    weight_threshold: 1,
    account_auths: [
      [utilsT.secondAccountOnState.keys.postingPubkey, 1], //'STM8KKUZb1CzwRiaN2RQcGeJUpcHM5BmCMudxXW21xqktBe91RpD8'
    ],
    key_auths: [[`@${username2}`, 1]],
  } as Authority;
  const account = { name: username, posting: postingAuthority } as Account;
  const account2 = { name: username2, active: activeAuthority } as Account;
  const accounts = [account] as Account[];
  const emptyState = [] as Account[];
  test('Calling ActionType.GET_ACCOUNTS must return accounts', () => {
    const getAccountsAction = {
      type: ActionType.GET_ACCOUNTS,
      payload: accounts,
    };
    const previuosState = emptyState;
    expect(AccountReducer(previuosState, getAccountsAction)).toEqual(accounts);
  });
  test('Calling ActionType.SET_ACCOUNTS must return accounts', () => {
    const setAccountsAction = {
      type: ActionType.SET_ACCOUNTS,
      payload: accounts,
    };
    const previuosState = emptyState;
    expect(AccountReducer(previuosState, setAccountsAction)).toEqual(accounts);
  });
  test('Calling ActionType.ADD_ACCOUNT if state is empty must return added account', () => {
    const addAccountAction = {
      type: ActionType.ADD_ACCOUNT,
      payload: account,
    };
    const previuosState = emptyState;
    expect(AccountReducer(previuosState, addAccountAction)).toEqual([account]);
  });
  test('Calling ActionType.ADD_ACCOUNT if state is not empty must return added account', () => {
    const addAccountAction = {
      type: ActionType.ADD_ACCOUNT,
      payload: account2,
    };
    const previuosState = accounts;
    expect(AccountReducer(previuosState, addAccountAction)).toEqual([
      account,
      account2,
    ]);
  });
  test('Calling ActionType.RESET_ACCOUNT must return an empty array', () => {
    const resetAccountAction = {
      type: ActionType.RESET_ACCOUNT,
    };
    const previuosState = accounts;
    expect(AccountReducer(previuosState, resetAccountAction)).toEqual([]);
  });
  test('Calling any other action must return the actual state', () => {
    const anyOtherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    const previuosState = accounts;
    expect(AccountReducer(previuosState, anyOtherAction)).toEqual(accounts);
  });
  test('Calling any other action if empty state, must return the actual empty state', () => {
    const anyOtherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    const previuosState = emptyState;
    expect(AccountReducer(previuosState, anyOtherAction)).toEqual(emptyState);
  });
});
