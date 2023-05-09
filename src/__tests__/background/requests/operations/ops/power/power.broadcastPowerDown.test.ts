import { broadcastPowerDown } from '@background/requests/operations/ops/power';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import powerMocks from 'src/__tests__/background/requests/operations/ops/mocks/power-mocks';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('power tests:\n', () => {
  const { methods, constants, mocks } = powerMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastPowerDown cases:\n', () => {
    describe('Default cases:\n', () => {
      it('Must return error if wrong global data', async () => {
        mocks.getDynamicGlobalProperties({});
        const result = await broadcastPowerDown(requestHandler, data.powerDown);
        expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
        expect(result.msg.result).toBeUndefined();
        expect(result.msg.error).not.toBeNull();
        expect(result.msg.message).toContain(
          "Cannot read properties of undefined (reading 'split')",
        );
      });
      it('Must return error if no key on handler', async () => {
        mocks.getDynamicGlobalProperties(dynamic.globalProperties);
        const result = await broadcastPowerDown(requestHandler, data.powerDown);
        const { request_id, ...datas } = data.powerDown;
        expect(result).toEqual(
          messages.error.answerError(
            new Error('html_popup_error_while_signing_transaction'),
            datas,
            request_id,
            mocksImplementation.i18nGetMessageCustom(
              'html_popup_error_while_signing_transaction',
            ),
            undefined,
          ),
        );
      });
      //TODO check bellow & fix.
      // it('Must return success', async () => {
      //   const mhiveTxSendOp = jest
      //     .spyOn(HiveTxUtils, 'sendOperation')
      //     .mockResolvedValue(transactionConfirmationSuccess);
      //   mocks.getDynamicGlobalProperties(dynamic.globalProperties);
      //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
      //   const result = await broadcastPowerDown(requestHandler, data.powerDown);
      //   const { request_id, ...datas } = data.powerDown;
      //   expect(result).toEqual(
      //     messages.success.answerSucess(
      //       transactionConfirmationSuccess,
      //       datas,
      //       request_id,
      //       chrome.i18n.getMessage('bgd_ops_pd', [
      //         datas.hive_power,
      //         datas.username,
      //       ]),
      //       undefined,
      //     ),
      //   );
      //   mhiveTxSendOp.mockRestore();
      // });
    });

    // describe('Using ledger cases:\n', () => {
    //   it('Must return success', async () => {
    //     mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
    //     mocks.LedgerModule.getSignatureFromLedger('signed!');
    //     mocks.broadcastAndConfirmTransactionWithSignature(
    //       transactionConfirmationSuccess,
    //     );
    //     mocks.getDynamicGlobalProperties(dynamic.globalProperties);
    //     requestHandler.data.key = '#ledgerKEY12345';
    //     const result = await broadcastPowerDown(requestHandler, data.powerDown);
    //     const { request_id, ...datas } = data.powerDown;
    //     expect(result).toEqual(
    //       messages.success.answerSucess(
    //         transactionConfirmationSuccess,
    //         datas,
    //         request_id,
    //         chrome.i18n.getMessage('bgd_ops_pd', [
    //           datas.hive_power,
    //           datas.username,
    //         ]),
    //         undefined,
    //       ),
    //     );
    //   });
    // });
  });
});
