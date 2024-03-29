import { LocalAccount } from '@interfaces/local-account.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { AppThunk } from 'src/popup/hive/actions/interfaces';
import { store } from 'src/popup/hive/store';
import TransactionUtils from 'src/popup/hive/utils/transaction.utils';

export const initAccountTransactions =
  (accountName: string): AppThunk =>
  async (dispatch, getState) => {
    const memoKey = getState().accounts.find(
      (a: LocalAccount) => a.name === accountName,
    )!.keys.memo;
    const result = await TransactionUtils.getAccountTransactions(
      accountName,
      -1,
      store.getState().globalProperties.globals!,
      memoKey!,
    );

    dispatch({
      type: ActionType.INIT_TRANSACTIONS,
      payload: result,
    });
  };

export const fetchAccountTransactions =
  (accountName: string, start: number): AppThunk =>
  async (dispatch, getState) => {
    const memoKey = getState().accounts.find(
      (a: LocalAccount) => a.name === accountName,
    )!.keys.memo;
    const result = await TransactionUtils.getAccountTransactions(
      accountName,
      start,
      store.getState().globalProperties.globals!,
      memoKey!,
    );

    dispatch({
      type: ActionType.ADD_TRANSACTIONS,
      payload: result,
    });
  };
