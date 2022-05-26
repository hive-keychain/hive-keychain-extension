import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Keys } from '@interfaces/keys.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActiveAccountReducer } from '@popup/reducers/active-account.reducer';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('active-account.reducer tests:\n', () => {
  const activeAccountSample = {
    account: {
      name: utilsT.userData.username,
      posting: { key_auths: [[`@${utilsT.userData.username}`, 1]] },
    },
    rc: { percentage: 90 } as Manabar,
    keys: { postingPubkey: utilsT.userData.encryptKeys.posting },
  } as ActiveAccount;
  const emptyActiveAccountState = {
    account: {} as ExtendedAccount,
    keys: {} as Keys,
    rc: {} as Manabar,
  } as ActiveAccount;
  test('Calling SET_ACTIVE_ACCOUNT must return the state with the added payload', () => {
    const setActiveAccountAction = {
      type: ActionType.SET_ACTIVE_ACCOUNT,
      payload: activeAccountSample,
    };
    const previousState = emptyActiveAccountState;
    expect(ActiveAccountReducer(previousState, setActiveAccountAction)).toEqual(
      activeAccountSample,
    );
  });
  test('Calling SET_ACTIVE_ACCOUNT with an undefined state must return the state with the added payload', () => {
    const setActiveAccountAction = {
      type: ActionType.SET_ACTIVE_ACCOUNT,
      payload: activeAccountSample,
    };
    const previousState = undefined;
    expect(ActiveAccountReducer(previousState, setActiveAccountAction)).toEqual(
      activeAccountSample,
    );
  });
  test('Calling SET_ACTIVE_ACCOUNT_RC must return the state with the added rc', () => {
    const addedManaBar = { percentage: 70 } as Manabar;
    const setActiveAccountRCAction = {
      type: ActionType.SET_ACTIVE_ACCOUNT_RC,
      payload: addedManaBar,
    };
    const previousState = emptyActiveAccountState;
    expect(
      ActiveAccountReducer(previousState, setActiveAccountRCAction),
    ).toEqual({ ...emptyActiveAccountState, rc: addedManaBar });
  });
  test('Calling FORGET_ACCOUNT must return initialized empty state', () => {
    const forgetAccountAction = {
      type: ActionType.FORGET_ACCOUNT,
    };
    const previousState = activeAccountSample;
    expect(ActiveAccountReducer(previousState, forgetAccountAction)).toEqual(
      emptyActiveAccountState,
    );
  });
  test('Calling FORGET_ACCOUNTS must return initialized empty state', () => {
    const forgetAccountsAction = {
      type: ActionType.FORGET_ACCOUNTS,
    };
    const previousState = activeAccountSample;
    expect(ActiveAccountReducer(previousState, forgetAccountsAction)).toEqual(
      emptyActiveAccountState,
    );
  });
  test('Calling RESET_ACTIVE_ACCOUNT must return initialized empty state', () => {
    const resetActiveAccountAction = {
      type: ActionType.RESET_ACTIVE_ACCOUNT,
    };
    const previousState = activeAccountSample;
    expect(
      ActiveAccountReducer(previousState, resetActiveAccountAction),
    ).toEqual(emptyActiveAccountState);
  });
  test('Calling any other action type, must return the actual state', () => {
    const otherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    const previousState = activeAccountSample;
    expect(ActiveAccountReducer(previousState, otherAction)).toEqual(
      activeAccountSample,
    );
  });
});
