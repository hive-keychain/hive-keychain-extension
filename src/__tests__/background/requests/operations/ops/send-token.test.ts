import { broadcastSendToken } from '@background/requests/operations/ops/send-token';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('send-token tests:\n', () => {
  const { methods, constants, mocks } = sendTokenMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('default cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const result = await broadcastSendToken(requestHandler, data);
      methods.assert.error(
        result,
        new Error('html_popup_error_while_signing_transaction'),
        data,
        mocksImplementation.i18nGetMessageCustom(
          'html_popup_error_while_signing_transaction',
        ),
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

  describe('Using ledger cases:\n', () => {
    it('Must return success', async () => {
      mocks.HiveTxUtils.sendOperation(true);
      mocks.LedgerModule.getSignatureFromLedger('signed!');
      mocks.broadcastAndConfirmTransactionWithSignature(true);
      requestHandler.data.key = '#ledger1234';
      const result = await broadcastSendToken(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          true,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_tokens'),
          undefined,
        ),
      );
    });
  });
});
