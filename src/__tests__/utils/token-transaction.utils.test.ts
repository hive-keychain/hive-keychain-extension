import {
  CommentCurationTransaction,
  DelegateTokenTransaction,
  MiningLotteryTransaction,
  StakeTokenTransaction,
  TransferTokenTransaction,
} from '@interfaces/tokens.interface';
import { TokenTransactionUtils } from 'src/utils/token-transaction.utils';

describe('token-transaction.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
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

  describe('filterTransfer tests:\n', () => {
    test('Passing a value(string) contained in the field(from), will return true', () => {
      const transfer = {
        from: 'THEGHOST',
        to: 'BLOCKTRADES',
        memo: 'TEST.MEMO',
      } as TransferTokenTransaction;
      expect(TokenTransactionUtils.filterTransfer(transfer, 'THEGHOST')).toBe(
        true,
      );
    });
    test('Passing a value(string) contained in the field(to), will return true', () => {
      const transfer = {
        from: 'quentin',
        to: 'theghost',
        memo: 'TEST.MEMO',
      } as TransferTokenTransaction;
      expect(TokenTransactionUtils.filterTransfer(transfer, 'THEGHOST')).toBe(
        true,
      );
    });
    test('Passing a value(string) contained in the field(memo), will return true', () => {
      const transfer = {
        from: 'quentin',
        to: 'BLOCKTRADES',
        memo: 'to theghost',
      } as TransferTokenTransaction;
      expect(TokenTransactionUtils.filterTransfer(transfer, 'theghost')).toBe(
        true,
      );
    });
    test('Passing a value(string) not contained in the fields, will return false', () => {
      const transfer = {
        from: 'quentin',
        to: 'BLOCKTRADES',
        memo: 'to theghost',
      } as TransferTokenTransaction;
      expect(TokenTransactionUtils.filterTransfer(transfer, 'test')).toBe(
        false,
      );
    });
  });

  describe('filterStake tests:\n', () => {
    test('Passing a value not contained in fields, must return false', () => {
      const stake = {
        to: 'theghost1980',
        from: 'quentin',
      } as StakeTokenTransaction;
      expect(TokenTransactionUtils.filterStake(stake, 'test')).toBe(false);
    });
    test('Passing a value contained in field(to), must return true', () => {
      const stake = {
        to: 'test.account',
        from: 'quentin',
      } as StakeTokenTransaction;
      expect(TokenTransactionUtils.filterStake(stake, 'test')).toBe(true);
    });
    test('Passing a value contained in field(from), must return true', () => {
      const stake = {
        to: 'test.account',
        from: 'quentin',
      } as StakeTokenTransaction;
      expect(TokenTransactionUtils.filterStake(stake, 'quentin')).toBe(true);
    });
  });

  describe('filterDelegation tests:\n', () => {
    const delegation = {
      delegatee: 'theghost1980',
      delegator: 'quentin',
    } as DelegateTokenTransaction;
    test('Passing a value not contained in fields, must return false', () => {
      expect(TokenTransactionUtils.filterDelegation(delegation, 'test')).toBe(
        false,
      );
    });
    test('Passing a value contained in field(delegatee), must return true', () => {
      expect(TokenTransactionUtils.filterDelegation(delegation, 'the')).toBe(
        true,
      );
    });
    test('Passing a value contained in field(delegator), must return true', () => {
      expect(
        TokenTransactionUtils.filterDelegation(delegation, 'quentin'),
      ).toBe(true);
    });
  });

  describe('filterMiningLottery tests:\n', () => {
    const lotteryTransaction = { poolId: '123456' } as MiningLotteryTransaction;
    test('Passing a value not present in poolId will return false', () => {
      expect(
        TokenTransactionUtils.filterMiningLottery(lotteryTransaction, 'test'),
      ).toBe(false);
    });
    test('Passing a partial value present in poolId will return true', () => {
      expect(
        TokenTransactionUtils.filterMiningLottery(lotteryTransaction, '123'),
      ).toBe(true);
    });
    test('Passing a full value present in poolId will return true', () => {
      expect(
        TokenTransactionUtils.filterMiningLottery(lotteryTransaction, '123456'),
      ).toBe(true);
    });
  });
});
