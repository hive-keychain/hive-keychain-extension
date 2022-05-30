import * as transactionActions from '@popup/actions/transaction.actions';
import TransactionUtils from 'src/utils/transaction.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialStateJustOneTransaction,
  initialStateWAccountsWActiveAccountStore,
} from 'src/__tests__/utils-for-testing/initial-states';

afterEach(() => {
  jest.clearAllMocks();
});
describe('transaction.actions tests:\n', () => {
  describe('initAccountTransactions tests:\n', () => {
    test('Must init transactions', async () => {
      TransactionUtils.getAccountTransactions = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeOneTransactionResponse);
      const fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(
        transactionActions.initAccountTransactions(utilsT.userData.username),
      );
      expect(fakeStore.getState().transactions).toEqual({
        list: utilsT.fakeOneTransactionResponse,
        loading: false,
      });
    });
  });

  describe('fetchAccountTransactions tests:\n', () => {
    test('Must add to transactions', async () => {
      const fakeNewTransactionResponse = [
        [
          {
            trx_id: '0000000000000000000000000000000000000000',
            block: 64467699,
            trx_in_block: 39,
            op_in_trx: 0,
            virtual_op: 0,
            timestamp: '2022-05-18T00:36:36',
            op: [
              'transfer',
              {
                from: 'workerjab1',
                to: 'keychain.tests',
                amount: '10000.001 HIVE',
                memo: '',
              },
            ],
          },
          10,
        ],
      ];
      TransactionUtils.getAccountTransactions = jest
        .fn()
        .mockResolvedValueOnce(fakeNewTransactionResponse);
      const fakeStore = getFakeStore(initialStateJustOneTransaction);
      await fakeStore.dispatch<any>(
        transactionActions.fetchAccountTransactions(
          utilsT.userData.username,
          -1,
        ),
      );
      expect(fakeStore.getState().transactions).toEqual({
        list: [],
        loading: false,
      });
    });
  });
});
