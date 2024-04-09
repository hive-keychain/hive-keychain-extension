import { LocalAccount } from '@interfaces/local-account.interface';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { store } from '@popup/multichain/store';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';
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
      type: HiveActionType.INIT_TRANSACTIONS,
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
      type: HiveActionType.ADD_TRANSACTIONS,
      payload: result,
    });
  };
