import {
  getEvmTransferMaxAmount,
  getEvmTransferValueHex,
} from '@popup/evm/pages/home/transfer/evm-transfer.component';
import Decimal from 'decimal.js';

describe('EvmTransferComponent helpers', () => {
  describe('getEvmTransferValueHex', () => {
    it('converts decimal native token amounts to valid hex wei without floating point math', () => {
      expect(getEvmTransferValueHex('0.0493', 18)).toBe('0xaf2616bb6d4000');
    });

    it('keeps the smallest unit exact', () => {
      expect(getEvmTransferValueHex('0.000000000000000001', 18)).toBe('0x1');
    });
  });

  describe('getEvmTransferMaxAmount', () => {
    it('reserves the estimated native transfer fee from MAX amount', () => {
      expect(getEvmTransferMaxAmount('1', new Decimal('0.000441'))).toBe(
        '0.999559',
      );
    });

    it('does not return a negative amount when the fee exceeds balance', () => {
      expect(getEvmTransferMaxAmount('0.0001', new Decimal('0.000441'))).toBe(
        '0',
      );
    });
  });
});
