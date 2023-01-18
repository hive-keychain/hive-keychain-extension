import { broadcastPowerUp } from '@background/requests/operations/ops/power';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import powerMocks from 'src/__tests__/background/requests/operations/ops/mocks/power-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('power tests:\n', () => {
  const { methods, constants, mocks } = powerMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastPowerUp cases:\n', () => {
    describe('Default cases:\n', () => {
      it('Must return error if no key on handler', async () => {
        const errorMessage =
          "Cannot read properties of undefined (reading 'toString')";
        const result = await broadcastPowerUp(requestHandler, data.powerUp);
        const { request_id, ...datas } = data.powerUp;
        expect(result).toEqual(
          messages.error.answerError(
            new TypeError(errorMessage),
            datas,
            request_id,
            errorMessage,
            undefined,
          ),
        );
      });
      it('Must return success', async () => {
        const mhiveTxSendOp = jest
          .spyOn(HiveTxUtils, 'sendOperation')
          .mockResolvedValue(true);
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastPowerUp(requestHandler, data.powerUp);
        const { request_id, ...datas } = data.powerUp;
        expect(result).toEqual(
          messages.success.answerSucess(
            true,
            datas,
            request_id,
            chrome.i18n.getMessage('bgd_ops_pu', [datas.hive, datas.recipient]),
            undefined,
          ),
        );
        mhiveTxSendOp.mockRestore();
      });
    });

    describe('Using ledger cases:\n', () => {
      it('Must return success', async () => {
        mocks.HiveTxUtils.sendOperation(true);
        mocks.LedgerModule.getSignatureFromLedger('signed!');
        mocks.broadcastAndConfirmTransactionWithSignature(true);
        requestHandler.data.key = '#ledgerKEY1233';
        const result = await broadcastPowerUp(requestHandler, data.powerUp);
        const { request_id, ...datas } = data.powerUp;
        expect(result).toEqual(
          messages.success.answerSucess(
            true,
            datas,
            request_id,
            chrome.i18n.getMessage('bgd_ops_pu', [datas.hive, datas.recipient]),
            undefined,
          ),
        );
      });
    });
  });
});
