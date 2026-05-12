import { getEvmTransferValueHex } from '@popup/evm/pages/home/transfer/evm-transfer.component';

describe('EvmTransferComponent helpers', () => {
  describe('getEvmTransferValueHex', () => {
    it('converts decimal native token amounts to valid hex wei without floating point math', () => {
      expect(getEvmTransferValueHex('0.0493', 18)).toBe('0xaf2616bb6d4000');
    });

    it('keeps the smallest unit exact', () => {
      expect(getEvmTransferValueHex('0.000000000000000001', 18)).toBe('0x1');
    });
  });
});
