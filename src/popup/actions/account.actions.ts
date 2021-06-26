import {LocalAccount} from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import {ActionType} from './action-type.enum';
import {AppThunk} from './interfaces';

export const getAccounts =
  (mk: string): AppThunk =>
  async () => {
    let accounts = await AccountUtils.getAccountsFromLocalStorage(mk);
    return {
      type: ActionType.GET_ACCOUNTS,
      payload: accounts ?? [],
    };
  };

export const addAccount = (account: LocalAccount) => {
  return {
    type: ActionType.ADD_ACCOUNT,
    payload: account,
  };
};
