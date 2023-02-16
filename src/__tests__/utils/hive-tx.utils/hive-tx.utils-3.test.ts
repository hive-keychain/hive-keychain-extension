import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import hiveTxUtilsMocks from 'src/__tests__/utils/mocks/hive-tx.utils-mocks';

describe('hive-tx.utils.test.ts part 3', () => {
  const { mocks, spies, constants } = hiveTxUtilsMocks;
  describe('signTransaction cases:\n', () => {
    describe('isUsingLedger cases:\n', () => {
      it('Must throw error if no hashSignPolicy prop', async () => {
        mocks.LedgerUtils.getSettingsError(new Error('ledger not detected'));
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#1qw23eer4e');
        } catch (error) {
          expect(error).toEqual(new KeychainError('error_while_broadcasting'));
        }
      });

      it('Must throw error if signHash', async () => {
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true });
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#1qw23eer4e');
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('error_ledger_no_hash_sign_policy'),
          );
        }
      });

      it('Must throw error if is not Displayable On Device & hashSignPolicy is false', async () => {
        mocks.LedgerUtils.getSettings({ hashSignPolicy: false });
        mocks.hive.isDisplayableOnDevice(false);
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#1qw23eer4e');
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('error_ledger_no_hash_sign_policy'),
          );
        }
      });

      it('Must call addSignature', async () => {
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true });
        mocks.hive.isDisplayableOnDevice(false);
        mocks.hive.getTransactionDigest('string_digest');
        mocks.LedgerUtils.signHash('signed');
        expect(await HiveTxUtils.signTransaction(constants.tx, '#qqqw11')).toBe(
          undefined,
        );
        expect(spies.hiveTransaction.addSignature).toBeCalledWith('signed');
      });

      it('Must return signature using LedgerUtils.signTransaction', async () => {
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true });
        mocks.hive.isDisplayableOnDevice(true);
        mocks.LedgerUtils.signTransaction({
          ...constants.tx,
          signatures: ['signed_here'],
        });
        expect(
          await HiveTxUtils.signTransaction(constants.tx, '#qqqw11'),
        ).toEqual({
          ...constants.tx,
          signatures: ['signed_here'],
        });
      });

      it('Must throw error if LedgerUtils.signTransaction fails', async () => {
        mocks.LedgerUtils.getSettings({ hashSignPolicy: false });
        mocks.hive.isDisplayableOnDevice(true);
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#qqqw11');
        } catch (error) {
          expect(error).toEqual(new KeychainError('html_ledger_not_supported'));
        }
      });

      it('Must throw error and call logger if signHash fails', async () => {
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true });
        mocks.hive.isDisplayableOnDevice(false);
        mocks.hive.getTransactionDigest('string_digest');
        mocks.LedgerUtils.signHashError(new Error('signHash error'));
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#qqqw11');
        } catch (error) {
          expect(error).toEqual(new Error('signHash error'));
          expect(spies.logger.err).toBeCalledWith(new Error('signHash error'));
        }
      });
    });

    describe('not using Ledger cases:\n', () => {
      it('Must return transaction signed', async () => {
        mocks.hiveTransaction.sign();
        expect(
          await HiveTxUtils.signTransaction(
            constants.tx,
            userData.one.nonEncryptKeys.active,
          ),
        ).toEqual({ ...constants.tx, signatures: ['signed'] });
      });

      it('Must throw error and call logger if not valid key', async () => {
        try {
          await HiveTxUtils.signTransaction(
            constants.tx,
            userData.one.encryptKeys.active,
          );
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('html_popup_error_while_signing_transaction'),
          );
          expect(spies.logger.err).toBeCalledWith(
            new Error('invalid private key'),
          );
        }
      });
    });
  });
});
