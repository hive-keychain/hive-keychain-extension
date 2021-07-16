import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import { ActionType } from './action-type.enum';
import { actionPayload, AppThunk } from './interfaces';

export const retrieveAccounts =
  (mk: string): AppThunk =>
  async (dispatch, getState) => {
    let accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    const action: actionPayload<LocalAccount[]> = {
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
