import { BalanceChangeCardUtils } from 'src/dialog/components/balance-change-card/balance-change-card.utils';

describe('BalanceChangeCardUtils', () => {
  describe('hasInsufficientBalance', () => {
    it('returns false when balance info is undefined', () => {
      expect(
        BalanceChangeCardUtils.hasInsufficientBalance(undefined),
      ).toBe(false);
    });

    it('returns false when all balances are sufficient', () => {
      expect(
        BalanceChangeCardUtils.hasInsufficientBalance({
          mainBalance: {
            symbol: 'ETH',
            before: '1 ETH',
            estimatedAfter: '0.5 ETH',
            insufficientBalance: false,
          },
          feeBalance: {
            symbol: 'ETH',
            before: '1 ETH',
            estimatedAfter: '0.9 ETH',
            insufficientBalance: false,
          },
        }),
      ).toBe(false);
    });

    it('returns true when main balance is insufficient', () => {
      expect(
        BalanceChangeCardUtils.hasInsufficientBalance({
          mainBalance: {
            symbol: 'USDC',
            before: '10 USDC',
            estimatedAfter: '-1 USDC',
            insufficientBalance: true,
          },
        }),
      ).toBe(true);
    });

    it('returns true when fee balance is insufficient', () => {
      expect(
        BalanceChangeCardUtils.hasInsufficientBalance({
          mainBalance: {
            symbol: 'USDC',
            before: '10 USDC',
            estimatedAfter: '5 USDC',
            insufficientBalance: false,
          },
          feeBalance: {
            symbol: 'ETH',
            before: '0.01 ETH',
            estimatedAfter: '-0.01 ETH',
            insufficientBalance: true,
          },
        }),
      ).toBe(true);
    });
  });
});
