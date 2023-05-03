import { Settings } from '@engrave/ledger-app-hive';
import { SignedTransaction } from '@hiveio/dhive';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import hiveTxUtilsMocks from 'src/__tests__/utils/mocks/hive-tx.utils-mocks';
describe('hive-tx.utils.ts part 2 tests:\n', () => {
  const { mocks, methods, spies, constants } = hiveTxUtilsMocks;
  methods.afterAll;
  describe('createSignAndBroadcastTransaction cases: \n', () => {
    describe('not using ledger & no signHash:\n', () => {
      it('Must return tx_id', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.hiveTransaction.sign();
        mocks.hiveTransaction.broadcast(constants.broadcastResponse.success);
        expect(
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            userData.one.nonEncryptKeys.posting,
          ),
        ).toBe(constants.broadcastResponse.success.result);
      });

      it('Must catch error, call logger and throw Error if not valid key', async () => {
        mocks.hiveTransaction.create(constants.tx);
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            userData.one.encryptKeys.posting,
          );
        } catch (error) {
          expect(spies.logger.err).toBeCalledWith(
            new Error('invalid private key'),
          );
          expect(error).toEqual(
            new Error('html_popup_error_while_signing_transaction'),
          );
        }
      });

      it('Must call logger and throw error, if broadcast fails', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.hiveTransaction.sign();
        mocks.hiveTransaction.broadcast(constants.broadcastResponse.error);
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            userData.one.nonEncryptKeys.posting,
          );
        } catch (error) {
          expect(spies.logger.err).toBeCalledWith(
            'Error during broadcast',
            'Error',
          );
          expect(error).toEqual(new KeychainError('error_while_broadcasting'));
        }
      });
    });

    describe('using ledger:\n', () => {
      it('Must catch and throw error if is not Displayable On Device', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.LedgerUtils.getSettings({ hashSignPolicy: false } as Settings);
        mocks.hive.isDisplayableOnDevice(false);
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('error_ledger_no_hash_sign_policy'),
          );
        }
      });

      it('Must return tx_id and broadcast', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true } as Settings);
        mocks.hive.isDisplayableOnDevice(false);
        mocks.createTransaction(constants.tx);
        mocks.hive.getTransactionDigest('string_digest');
        mocks.LedgerUtils.signHash('signed_string');
        mocks.hiveTransaction.broadcast(constants.broadcastResponse.success);
        expect(
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          ),
        ).toEqual(constants.broadcastResponse.success.result);
        expect(spies.hiveTransaction.addSignature).toBeCalledWith(
          'signed_string',
        );
      });

      it('Must return tx_id and broadcast using signtransaction', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true } as Settings);
        mocks.hive.isDisplayableOnDevice(true);
        mocks.LedgerUtils.signTransaction({
          signatures: ['signed'],
        } as SignedTransaction);
        mocks.hiveTransaction.broadcast(constants.broadcastResponse.success);
        expect(
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          ),
        ).toEqual(constants.broadcastResponse.success.result);
        expect(spies.hiveTransaction.addSignature).toBeCalledWith('signed');
      });

      it('Must throw error', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true } as Settings);
        mocks.hive.isDisplayableOnDevice(true);
        mocks.LedgerUtils.signTransaction({} as SignedTransaction);
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new TypeError("Cannot read properties of undefined (reading '0')"), //new KeychainError('popup_html_ledger_unknown_error'),
          );
          expect(spies.logger.err).toBeCalledWith(
            new TypeError("Cannot read properties of undefined (reading '0')"),
          );
        }
      });

      it('Must throw error and call logger if getSettings fails', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.LedgerUtils.getSettingsError(new Error('error getting settings'));
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('popup_html_ledger_unknown_error'),
          );
        }
      });

      it('Must throw error if broadcast fails', async () => {
        mocks.hiveTransaction.create(constants.tx);
        mocks.LedgerUtils.getSettings({ hashSignPolicy: true } as Settings);
        mocks.hive.isDisplayableOnDevice(false);
        mocks.createTransaction(constants.tx);
        mocks.hive.getTransactionDigest('string_digest');
        mocks.LedgerUtils.signHash('signed_string');
        mocks.hiveTransaction.broadcastError(new Error('error broadcasting'));
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new Error('html_popup_error_while_broadcasting'),
          );
        }
      });
    });
  });
});
