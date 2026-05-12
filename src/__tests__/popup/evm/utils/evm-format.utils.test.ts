import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';

describe('evm-format.utils tests', () => {
  describe('formatTokenBalance', () => {
    it('formats token balances consistently', () => {
      expect(EvmFormatUtils.formatTokenBalance('1234567.890000', 8)).toBe(
        '1,234,567.89',
      );
      expect(EvmFormatUtils.formatTokenBalance('0.000000001', 5)).toBe('~0');
      expect(EvmFormatUtils.formatTokenBalance('1.23456789', 5)).toBe(
        '1.23457',
      );
    });
  });

  describe('formatGweiFromWei', () => {
    it('formats wei values as Gwei', () => {
      expect(EvmFormatUtils.formatGweiFromWei(1234567890n)).toBe(
        '1.23456789 Gwei',
      );
    });

    it('formats ETH values as Gwei', () => {
      expect(EvmFormatUtils.formatGweiFromEth('0.000000001')).toBe('1 Gwei');
    });
  });
});
