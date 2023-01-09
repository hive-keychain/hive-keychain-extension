import { KeychainError } from 'src/keychain-error';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
jest.setTimeout(50000);
afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});
describe('tokens.utils tests:\n', () => {
  let fakeTransactionResponse = {
    blockNumber: 12,
    refSteemBlockNumber: 25797141,
    transactionId: 'b299d24be543cd50369dbc83cf6ce10e2e8abc9b',
    sender: 'smmarkettoken',
    contract: 'smmkt',
    action: 'updateBeneficiaries',
    payload: JSON.stringify({
      beneficiaries: ['harpagon'],
      isSignedWithActiveKey: true,
    }),
    hash: 'ac33d2fcaf2d72477483ab1f2ed4bf3bb077cdb55d5371aa896e8f3fd034e6fd',
    logs: '{}',
  };
  describe('tryConfirmTransaction tests;\n', () => {
    test('Must confirm transaction', async () => {
      const spyGetDelayedTransactionInfo = jest
        .spyOn(HiveEngineUtils, 'getDelayedTransactionInfo')
        .mockResolvedValue({ result: fakeTransactionResponse });
      const result = await HiveEngineUtils.tryConfirmTransaction(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toEqual({
        broadcasted: true,
        confirmed: true,
      });
      expect(spyGetDelayedTransactionInfo).toBeCalledTimes(1);
      expect(spyGetDelayedTransactionInfo).toBeCalledWith(
        fakeTransactionResponse.transactionId,
      );
      spyGetDelayedTransactionInfo.mockReset();
      spyGetDelayedTransactionInfo.mockRestore();
    });
    test('Must return an unhandled error', async () => {
      const error = 'Fatality Error.';
      fakeTransactionResponse.logs = JSON.stringify({ errors: [error] });
      const spyGetDelayedTransactionInfo = jest
        .spyOn(HiveEngineUtils, 'getDelayedTransactionInfo')
        .mockResolvedValue({ result: fakeTransactionResponse });
      try {
        const result = await HiveEngineUtils.tryConfirmTransaction(
          fakeTransactionResponse.transactionId,
        );
        expect(result).toEqual({
          confirmed: false,
          broadcasted: true,
        });
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('bgd_ops_hive_engine_confirmation_error'),
        );
      }
      expect(spyGetDelayedTransactionInfo).toBeCalledTimes(1);
      expect(spyGetDelayedTransactionInfo).toBeCalledWith(
        fakeTransactionResponse.transactionId,
      );
      spyGetDelayedTransactionInfo.mockReset();
      spyGetDelayedTransactionInfo.mockRestore();
    });
    test('If transaction gets never confirmed must return { confirmed:false, broadcasted: true, }', async () => {
      const iterationsOnGetDelayed = 20;
      const spyGetDelayedTransactionInfo = jest
        .spyOn(HiveEngineUtils, 'getDelayedTransactionInfo')
        .mockResolvedValue({ result: null });
      const result = await HiveEngineUtils.tryConfirmTransaction(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toEqual({
        confirmed: false,
        broadcasted: true,
      });
      expect(spyGetDelayedTransactionInfo).toBeCalledTimes(
        iterationsOnGetDelayed,
      );
      expect(spyGetDelayedTransactionInfo).toBeCalledWith(
        fakeTransactionResponse.transactionId,
      );
      spyGetDelayedTransactionInfo.mockReset();
      spyGetDelayedTransactionInfo.mockRestore();
    });
  });
});
