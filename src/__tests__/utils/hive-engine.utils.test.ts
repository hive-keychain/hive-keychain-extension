import hiveEngineUtilsMocks from 'src/__tests__/utils/mocks/hive-engine.utils-mocks';
import { KeychainError } from 'src/keychain-error';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
//TODO bellow check & fix!
describe('hive-engine.utils tests:\n', () => {
  const { mocks, constants, methods } = hiveEngineUtilsMocks;
  methods.afterEach;
  // describe('sendOperation cases:\n', () => {
  //   it('Must send operation and return tx id', async () => {
  //     // mocks.createSignAndBroadcastTransaction(transactionConfirmationSuccess);
  //     mocks.tryConfirmTransaction(constants.status.confirmed);
  //     expect(
  //       await HiveEngineUtils.sendOperation(
  //         constants.customJsonOperation,
  //         KeyType.POSTING,
  //       ),
  //     ).toEqual(constants.status.confirmed);
  //   });

  //   it('Must return status as failed', async () => {
  //     mocks.createSignAndBroadcastTransaction(undefined);
  //     expect(
  //       await HiveEngineUtils.sendOperation(
  //         constants.customJsonOperation,
  //         KeyType.POSTING,
  //       ),
  //     ).toEqual(constants.status.failed);
  //   });
  // });

  describe('tryConfirmTransaction cases:\n', () => {
    //TODO fix & check bellow
    // it('Must return confirmed status as false', async () => {
    //   mocks.getDelayedTransactionInfo({ result: null });
    //   expect(await HiveEngineUtils.tryConfirmTransaction('1234')).toEqual(
    //     constants.status.notConfirmed,
    //   );
    // });
    //TODO fix & check bellow
    // it('Must return confirmed operation', async () => {
    //   mocks.getDelayedTransactionInfo({
    //     result: { data: 'broadcasted succesfully' },
    //   });
    //   expect(await HiveEngineUtils.tryConfirmTransaction('1234')).toEqual(
    //     constants.status.confirmed,
    //   );
    // });

    it('Must throw error with KeychainError', async () => {
      mocks.getDelayedTransactionInfo({
        result: {
          payload: JSON.stringify({ op: 'done' }),
          logs: JSON.stringify({ errors: ['Error 1'] }),
        },
      });
      try {
        await HiveEngineUtils.tryConfirmTransaction('1234');
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('bgd_ops_hive_engine_confirmation_error'),
        );
      }
    });
  });
});
