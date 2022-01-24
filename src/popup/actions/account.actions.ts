import { refreshKeys } from '@popup/actions/active-account.actions';
import { KeyType } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import { ActionType } from './action-type.enum';
import { ActionPayload, AppThunk } from './interfaces';

export const retrieveAccounts =
  (mk: string): AppThunk =>
  async (dispatch, getState) => {
    let accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    const action: ActionPayload<LocalAccount[]> = {
      type: ActionType.SET_ACCOUNTS,
      payload: accounts,
    };
    if (accounts) {
      dispatch(action);
    }
  };

export const addAccount = (account: LocalAccount) => {
  return {
    type: ActionType.ADD_ACCOUNT,
    payload: account,
  };
};

export const resetAccount = () => {
  return {
    type: ActionType.RESET_ACCOUNT,
  };
};

export const setAccounts = (accounts: LocalAccount[]) => {
  return {
    type: ActionType.SET_ACCOUNTS,
    payload: accounts,
  };
};

export const addKey =
  (privateKey: string, keyType: KeyType): AppThunk =>
  async (dispatch, getState) => {
    const { activeAccount, accounts } = getState();

    const newAccounts = await AccountUtils.addKey(
      activeAccount,
      accounts,
      privateKey,
      keyType,
    );

    const activeLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === activeAccount.name,
    );

    if (newAccounts) {
      const action: ActionPayload<LocalAccount[]> = {
        type: ActionType.SET_ACCOUNTS,
        payload: newAccounts,
      };
      dispatch(action);
      dispatch(refreshKeys(activeLocalAccount));
    }
  };

export const removeKey =
  (type: KeyType): AppThunk =>
  async (dispatch, getState) => {
    const { activeAccount, accounts } = getState();
    const activeLocalAccount = accounts.find(
      (account: LocalAccount) => account.name === activeAccount.name,
    );

    const action: ActionPayload<LocalAccount[]> = {
      type: ActionType.SET_ACCOUNTS,
      payload: AccountUtils.deleteKey(type, accounts, activeAccount),
    };
    if (accounts) {
      dispatch(action);
      dispatch(refreshKeys(activeLocalAccount));
    }
  };
