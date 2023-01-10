import { broadcastSendToken } from '@background/requests/operations/ops/send-token';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('send-token tests:\n', () => {
  const { methods, constants } = sendTokenMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const errorMessage =
      "Cannot read properties of undefined (reading 'toString')";
    const result = await broadcastSendToken(requestHandler, data);
    methods.assert.error(
      result,
      new TypeError(errorMessage),
      data,
      errorMessage,
    );
  });
  it('Must return success', async () => {
    const mhiveTxCreateSignAndBroadcastTransaction = jest
      .spyOn(HiveTxUtils, 'createSignAndBroadcastTransaction')
      .mockResolvedValue('id_tx');
    const mTryConfirmTransaction = jest
      .spyOn(HiveEngineUtils, 'tryConfirmTransaction')
      .mockResolvedValue({ confirmed: true, broadcasted: true });
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastSendToken(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.answerSucess(
        { confirmed: true, broadcasted: true },
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_tokens'),
        undefined,
      ),
    );
    mhiveTxCreateSignAndBroadcastTransaction.mockRestore();
    mTryConfirmTransaction.mockRestore();
  });
});
