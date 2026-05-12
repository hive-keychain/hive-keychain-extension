import { formatMainTokenWeiAmount } from 'src/dialog/evm/requests/send-transaction/send-transaction-init';

describe('send-transaction-init', () => {
  describe('formatMainTokenWeiAmount', () => {
    it('formats native token wei amounts without JavaScript number precision artifacts', () => {
      expect(formatMainTokenWeiAmount('49300000000000000', 'ETH')).toBe(
        '0.0493 ETH',
      );
    });

    it('accepts hex wei amounts', () => {
      expect(formatMainTokenWeiAmount('0xaf2616bb6d4000', 'ETH')).toBe(
        '0.0493 ETH',
      );
    });
  });
});
