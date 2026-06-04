import { EvmLedgerDialogUtils } from 'src/dialog/evm/evm-ledger-dialog.utils';
import { EvmAccountSource } from 'src/popup/evm/interfaces/wallet.interface';

describe('EvmLedgerDialogUtils', () => {
  it('returns the Ledger confirmation caption for Ledger accounts', () => {
    expect(
      EvmLedgerDialogUtils.getLedgerConfirmationCaption({
        source: EvmAccountSource.LEDGER,
      }),
    ).toBe('popup_html_validate_transaction_on_ledger');
  });

  it('does not return a caption for seed accounts', () => {
    expect(
      EvmLedgerDialogUtils.getLedgerConfirmationCaption({
        source: EvmAccountSource.SEED,
      }),
    ).toBeUndefined();
  });

  it('finds Ledger accounts by address case-insensitively', () => {
    expect(
      EvmLedgerDialogUtils.getLedgerConfirmationCaptionForAddress(
        [
          {
            id: 0,
            path: "m/44'/60'/0'/0/0",
            address: '0xABCDEF0000000000000000000000000000000000',
            seedId: 1,
            source: EvmAccountSource.LEDGER,
          },
        ],
        '0xabcdef0000000000000000000000000000000000',
      ),
    ).toBe('popup_html_validate_transaction_on_ledger');
  });
});
