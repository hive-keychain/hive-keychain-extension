import {
  getEvmTransferDisplayAmount,
  getEvmTransferErrorMessage,
  getEvmTransferMaxAmount,
  getEvmTransferValueHex,
} from '@popup/evm/pages/home/transfer/evm-transfer.component';
import Decimal from 'decimal.js';
import { KeychainError } from 'src/keychain-error';

describe('EvmTransferComponent helpers', () => {
  describe('getEvmTransferDisplayAmount', () => {
    it('formats transfer display amounts with the token symbol', () => {
      expect(getEvmTransferDisplayAmount('1.230000', 18, 'ETH')).toBe(
        '1.23 ETH',
      );
      expect(getEvmTransferDisplayAmount('1000', 18, 'TKN')).toBe(
        '1,000 TKN',
      );
    });
  });

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

    it('rounds down to the token precision after reserving the native transfer fee', () => {
      const maxAmount = getEvmTransferMaxAmount(
        '1',
        new Decimal('0.0000000000000000001'),
        18,
      );

      expect(maxAmount).toBe('0.999999999999999999');
      expect(getEvmTransferValueHex(maxAmount, 18)).toBe(
        '0xde0b6b3a763ffff',
      );
    });
  });

  describe('getEvmTransferErrorMessage', () => {
    it('keeps specific Keychain errors from Ledger signing', () => {
      expect(
        getEvmTransferErrorMessage(
          new KeychainError('evm_ledger_open_ethereum_app'),
        ),
      ).toEqual({
        key: 'evm_ledger_open_ethereum_app',
        params: [],
      });
    });

    it('uses the generic transfer failure for unknown errors', () => {
      expect(getEvmTransferErrorMessage(new Error('boom'))).toEqual({
        key: 'popup_html_transfer_failed',
        params: [],
      });
    });
  });
});
