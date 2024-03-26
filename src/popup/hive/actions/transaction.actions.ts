import { LocalAccount } from '@interfaces/local-account.interface';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { store } from '@popup/multichain/store';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import TransactionUtils from 'src/popup/hive/utils/transaction.utils';

export const initAccountTransactions =
  (accountName: string): AppThunk =>
  async (dispatch, getState) => {
    const memoKey = getState().hive.accounts.find(
      (a: LocalAccount) => a.name === accountName,
    )!.keys.memo;
    const result = await TransactionUtils.getAccountTransactions(
      accountName,
      -1,
      store.getState().hive.globalProperties.globals!,
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
    const memoKey = getState().hive.accounts.find(
      (a: LocalAccount) => a.name === accountName,
    )!.keys.memo;
    const result = await TransactionUtils.getAccountTransactions(
      accountName,
      start,
      store.getState().hive.globalProperties.globals!,
      memoKey!,
    );

    dispatch({
      type: ActionType.ADD_TRANSACTIONS,
      payload: result,
    });
  };
