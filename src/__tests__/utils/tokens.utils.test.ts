import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import { HiveEngineUtilsV2 } from 'src/utils/hive-engine-v2.utils';
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
    payload: {
      beneficiaries: ['harpagon'],
      isSignedWithActiveKey: true,
    },
    hash: 'ac33d2fcaf2d72477483ab1f2ed4bf3bb077cdb55d5371aa896e8f3fd034e6fd',
    logs: '{}',
  };
  describe('tryConfirmTransaction tests;\n', () => {
    test('If transaction gets confirmed, must return { confirmed:true, error:null }', async () => {
      const spyGetDelayedTransactionInfo = jest
        .spyOn(HiveEngineUtilsV2, 'getDelayedTransactionInfo')
        .mockResolvedValueOnce(fakeTransactionResponse);
      const result = await HiveEngineUtilsV2.tryConfirmTransaction(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toEqual({
        confirmed: true,
        error: null,
      });
      expect(spyGetDelayedTransactionInfo).toBeCalledTimes(1);
      expect(spyGetDelayedTransactionInfo).toBeCalledWith(
        fakeTransactionResponse.transactionId,
      );
      spyGetDelayedTransactionInfo.mockReset();
      spyGetDelayedTransactionInfo.mockRestore();
    });
    test('If transaction gets confirmed with errors, must return { confirmed:true, error:[detailed description] }', async () => {
      const error = { name: 'Fatality Error.' };
      fakeTransactionResponse.logs = JSON.stringify({ errors: [error] });
      const spyGetDelayedTransactionInfo = jest
        .spyOn(HiveEngineUtilsV2, 'getDelayedTransactionInfo')
        .mockResolvedValueOnce(fakeTransactionResponse);
      const result = await HiveEngineUtilsV2.tryConfirmTransaction(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toEqual({
        confirmed: true,
        error: error,
      });
      expect(spyGetDelayedTransactionInfo).toBeCalledTimes(1);
      expect(spyGetDelayedTransactionInfo).toBeCalledWith(
        fakeTransactionResponse.transactionId,
      );
      spyGetDelayedTransactionInfo.mockReset();
      spyGetDelayedTransactionInfo.mockRestore();
    });
    test('If transaction gets never confirmed must return { confirmed:false, error: null }', async () => {
      const iterationsOnGetDelayed = 20;
      const spyGetDelayedTransactionInfo = jest
        .spyOn(HiveEngineUtilsV2, 'getDelayedTransactionInfo')
        .mockResolvedValue(null);
      const result = await HiveEngineUtilsV2.tryConfirmTransaction(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toEqual({
        confirmed: false,
        error: null,
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

  describe('getDelayedTransactionInfo tests"\n', () => {
    test('If the transaction is found must return the transaction data', async () => {
      HiveEngineConfigUtils.getApi().getTransactionInfo = jest
        .fn()
        .mockImplementation(() => Promise.resolve(fakeTransactionResponse));
      const result = await HiveEngineUtilsV2.getDelayedTransactionInfo(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toEqual(fakeTransactionResponse);
    });
    test('If the transaction is not found must return null', async () => {
      HiveEngineConfigUtils.getApi().getTransactionInfo = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));
      const result = await HiveEngineUtilsV2.getDelayedTransactionInfo(
        fakeTransactionResponse.transactionId,
      );
      expect(result).toBe(null);
    });
  });
});
