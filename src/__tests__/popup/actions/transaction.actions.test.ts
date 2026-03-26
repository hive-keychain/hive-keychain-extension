import multichainReducers from '@popup/multichain/reducers';
import TransactionUtils from '@hiveapp/utils/transaction.utils';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import * as transactionActions from 'src/popup/hive/actions/transaction.actions';

/** Thunks use `getState().hive`; tests must use multichain reducers, not hive-only. */
const createMultichainTestStore = () => {
  const seed = createStore(multichainReducers, applyMiddleware(thunk));
  const empty = seed.getState();
  return createStore(
    multichainReducers,
    {
      ...empty,
      hive: {
        ...empty.hive,
        accounts: [localAccounts.user1, localAccounts.user2],
        globalProperties: {
          ...empty.hive.globalProperties,
          globals: dynamic.globalProperties,
          price: dynamic.medianHistoryPrice,
          rewardFund: dynamic.rewardFund,
        },
      },
    },
    applyMiddleware(thunk),
  );
};

describe('transaction.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const transaction = {
    trx_id: '0000000000000000000000000000000000999999',
    block: 64467698,
    trx_in_block: 34,
    op_in_trx: 0,
    virtual_op: 0,
    timestamp: '2022-05-18T00:36:36',
    op: [
      'transfer',
      {
        from: 'workerjab1',
        to: 'keychain.tests',
        amount: '0.001 HIVE',
        memo: '',
      },
    ],
  };
  const transaction2 = {
    trx_id: '0000000000000000000000000000000000000000',
    block: 64467699,
    trx_in_trx: 39,
    op_in_trx: 1,
    virtual_op: 1,
    timestamp: '2022-05-20T00:36:36',
    op: [
      'transfer',
      {
        from: 'workerjab1',
        to: 'keychain.tests',
        amount: '100.000 HIVE',
        memo: '',
      },
    ],
  };
  describe('initAccountTransactions tests:\n', () => {
    test('Must init transactions', async () => {
      const fakeResponse = [[transaction], -1];
      TransactionUtils.getAccountTransactions = jest
        .fn()
        .mockResolvedValueOnce(fakeResponse);
      const fakeStore = createMultichainTestStore();
      await fakeStore.dispatch<any>(
        transactionActions.initAccountTransactions(
          localAccounts.user1.name,
        ),
      );
      expect(fakeStore.getState().hive.transactions).toEqual({
        list: fakeResponse,
        loading: false,
      });
    });
  });

  describe('fetchAccountTransactions tests:\n', () => {
    test('Must add to transactions', async () => {
      const fakeResponse = [[transaction2], 1000];
      TransactionUtils.getAccountTransactions = jest
        .fn()
        .mockResolvedValueOnce(fakeResponse);
      const fakeStore = createMultichainTestStore();
      await fakeStore.dispatch<any>(
        transactionActions.fetchAccountTransactions(
          localAccounts.user2.name,
          -1,
        ),
      );
      expect(fakeStore.getState().hive.transactions).toEqual({
        list: fakeResponse[0],
        loading: false,
        lastUsedStart: 1000,
      });
    });
  });
});
