import { LocalAccount } from '@interfaces/local-account.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import TransactionUtils from 'src/utils/transaction.utils';

export const initAccountTransactions =
  (accountName: string): AppThunk =>
  async (dispatch, getState) => {
    const memoKey = getState().accounts.find(
      (a: LocalAccount) => a.name === accountName,
    )!.keys.memo;
    const transfers = await TransactionUtils.getAccountTransactions(
      accountName,
      null,
      memoKey,
    );

    dispatch({
      type: ActionType.INIT_TRANSACTIONS,
      payload: transfers,
    });
  };

export const fetchAccountTransactions =
  (accountName: string, start: number): AppThunk =>
  async (dispatch, getState) => {
    const memoKey = getState().accounts.find(
      (a: LocalAccount) => a.name === accountName,
    )!.keys.memo;
    const transfers = await TransactionUtils.getAccountTransactions(
      accountName,
      start,
      memoKey,
    );
    dispatch({
      type: ActionType.ADD_TRANSACTIONS,
      payload: transfers,
    });
  };
