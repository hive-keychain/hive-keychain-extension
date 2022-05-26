import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import TransactionReducer from '@popup/reducers/transactions.reducer';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

describe('transactions.reducer tests:\n', () => {
  const initialEmptyState = {
    loading: false,
    list: [],
    lastUsedStart: -1,
  } as Transactions;
  const initialEmptyStateLoading = {
    loading: true,
    list: [],
    lastUsedStart: -1,
  } as Transactions;
  const notEmptyState = {
    loading: false,
    list: utilsT.transactionList,
    lastUsedStart: -1,
  } as Transactions;
  const notEmptyStateW2Dup = {
    loading: false,
    list: [utilsT.transactionList[1], utilsT.transactionList[1]],
    lastUsedStart: -1,
  } as Transactions;

  test('Calling any other action must return initialized state', () => {
    const otherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    expect(TransactionReducer(undefined, otherAction)).toEqual(
      initialEmptyState,
    );
  });
  test('Calling any other action with a previous state, must return previous state', () => {
    const otherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    const previuosState = notEmptyState;
    expect(TransactionReducer(previuosState, otherAction)).toEqual(
      notEmptyState,
    );
  });
  test('Calling SET_ACTIVE_ACCOUNT must reset the transaction list and return a reseted state', () => {
    const setActiveAccountAction = {
      type: ActionType.SET_ACTIVE_ACCOUNT,
    };
    expect(TransactionReducer(undefined, setActiveAccountAction)).toEqual(
      initialEmptyStateLoading,
    );
  });
  test('Calling INIT_TRANSACTIONS must return the payload as the new list on the state', async () => {
    const transactionListTuple = [utilsT.transactionList, 1] as [
      Transaction[],
      number,
    ];
    const initTransactionsAction = {
      type: ActionType.INIT_TRANSACTIONS,
      payload: transactionListTuple,
    };
    expect(TransactionReducer(undefined, initTransactionsAction)).toEqual({
      loading: false,
      list: transactionListTuple,
    });
  });
  test('Calling ADD_TRANSACTIONS, passing previousState as initialEmptyState, must return a new array with added transactions and the lastUsedStart', async () => {
    const transactionListTuple = [utilsT.transactionList, 1] as [
      Transaction[],
      number,
    ];
    const addTransactionsAction = {
      type: ActionType.ADD_TRANSACTIONS,
      payload: transactionListTuple,
    };
    expect(
      TransactionReducer(initialEmptyState, addTransactionsAction),
    ).toEqual({
      list: transactionListTuple[0],
      lastUsedStart: transactionListTuple[1],
      loading: false,
    });
  });
  test('Calling ADD_TRANSACTIONS, passing previousState as an array with 2 duplicates, must return a new array with added transactions(no duplicates) and the lastUsedStart', async () => {
    const transactionListTuple = [utilsT.transactionList, 1000] as [
      Transaction[],
      number,
    ];
    const addTransactionsAction = {
      type: ActionType.ADD_TRANSACTIONS,
      payload: transactionListTuple,
    };
    expect(
      TransactionReducer(notEmptyStateW2Dup, addTransactionsAction),
    ).toEqual({
      list: utilsT.expectedListResult,
      lastUsedStart: transactionListTuple[1],
      loading: false,
    });
  });
});
