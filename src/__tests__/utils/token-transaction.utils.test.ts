import { CommentCurationTransaction } from '@interfaces/tokens.interface';
import { TokenTransactionUtils } from 'src/utils/token-transaction.utils';

describe('token-transaction.utils tests:\n', () => {
  describe('filterCurationReward tests:\n', () => {
    test('Passing a string(uppercase) contained in a permlink, must return true', () => {
      const curationTransaction = {
        authorPerm: 'PERMILINK-TEST-KEYCHAIN',
      } as CommentCurationTransaction;
      expect(
        TokenTransactionUtils.filterCurationReward(curationTransaction, 'TEST'),
      ).toBe(true);
    });
    test('Passing a string(lowercase) contained in a permlink, must return true', () => {
      const curationTransaction = {
        authorPerm: 'PERMILINK-TEST-KEYCHAIN',
      } as CommentCurationTransaction;
      expect(
        TokenTransactionUtils.filterCurationReward(curationTransaction, 'test'),
      ).toBe(true);
    });
    test('Passing a string not contained in a permlink, must return false', () => {
      const curationTransaction = {
        authorPerm: 'PERMILINK-TEST-KEYCHAIN',
      } as CommentCurationTransaction;
      expect(
        TokenTransactionUtils.filterCurationReward(curationTransaction, 'hive'),
      ).toBe(false);
    });
  });
});
