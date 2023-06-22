import * as transactionActions from '@popup/actions/transaction.actions';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';
import TransactionUtils from 'src/utils/transaction.utils';

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
    trx_in_block: 39,
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
      const fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(
        transactionActions.initAccountTransactions(userData.one.username),
      );
      expect(fakeStore.getState().transactions).toEqual({
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
      const fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(
        transactionActions.fetchAccountTransactions(userData.two.username, -1),
      );
      expect(fakeStore.getState().transactions).toEqual({
        list: fakeResponse[0],
        loading: false,
        lastUsedStart: 1000,
      });
    });
  });
});
