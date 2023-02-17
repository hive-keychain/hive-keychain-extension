import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import hiveTxUtilsMocks from 'src/__tests__/utils/mocks/hive-tx.utils-mocks';

describe('hive-tx.utils.test.ts part 4', () => {
  const { mocks, constants, spies } = hiveTxUtilsMocks;
  describe('broadcastAndConfirmTransactionWithSignature cases:\n', () => {
    it('Must return true when broadcast and confirmed', async () => {
      mocks.hiveTransaction.addSignature('signature');
      mocks.hiveTransaction.broadcast(constants.broadcastResponse.success);
      mocks.confirmTransaction(true);
      expect(
        await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          constants.tx,
          'signature',
        ),
      ).toBe(true);
    });

    it('Must throw error and call logger if error on Hive Tx', async () => {
      mocks.hiveTransaction.addSignature('signature');
      mocks.hiveTransaction.broadcast(constants.broadcastResponse.error);
      try {
        await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          constants.tx,
          'signature',
        );
      } catch (error) {
        expect(error).toEqual(new KeychainError('error_while_broadcasting'));
        expect(spies.logger.err).toBeCalledWith(
          'Error during broadcast',
          constants.broadcastResponse.error.error,
        );
      }
    });

    it('Must throw error and call logger if error on broadcast', async () => {
      mocks.hiveTransaction.addSignature('signature');
      mocks.hiveTransaction.broadcastError(new Error('error on broadcast'));
      try {
        await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          constants.tx,
          'signature',
        );
      } catch (error) {
        expect(error).toEqual(new Error('html_popup_error_while_broadcasting'));
        expect(spies.logger.err).toBeCalledWith(
          new Error('error on broadcast'),
        );
      }
    });
  });
});
