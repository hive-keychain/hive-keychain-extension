import { broadcastCustomJson } from '@background/requests/operations/ops/custom-json';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import customJsonMocks from 'src/__tests__/background/requests/operations/ops/mocks/custom-json-mocks';
//TODO check & fix tests bellow!
describe('custom-json tests:\n', () => {
  const { methods, constants, mocks, spies } = customJsonMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Default cases:\n', () => {
    it('Must call getUserKey if no key on handler', async () => {
      await broadcastCustomJson(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        data.method.toLowerCase() as KeychainKeyTypesLC,
      );
    });
    // it('Must return success', async () => {
    //   const mHiveTxSendOp = jest
    //     .spyOn(HiveTxUtils, 'sendOperation')
    //     .mockResolvedValueOnce(transactionConfirmationSuccess);
    //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
    //   const result = await broadcastCustomJson(requestHandler, data);
    //   const { request_id, ...datas } = data;
    //   expect(result).toEqual(
    //     messages.success.broadcast(
    //       transactionConfirmationSuccess,
    //       datas,
    //       request_id,
    //       chrome.i18n.getMessage('bgd_ops_broadcast'),
    //     ),
    //   );
    //   mHiveTxSendOp.mockRestore();
    // });
  });

  // describe('Using Ledger cases:\n', () => {
  //   it('Must return success', async () => {
  //     mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
  //     mocks.LedgerModule.getSignatureFromLedger('signed!');
  //     mocks.broadcastAndConfirmTransactionWithSignature(
  //       transactionConfirmationSuccess,
  //     );
  //     requestHandler.data.key = '#ledgerKEY1234';
  //     const result = await broadcastCustomJson(requestHandler, data);
  //     const { request_id, ...datas } = data;
  //     expect(result).toEqual(
  //       messages.success.broadcast(
  //         transactionConfirmationSuccess,
  //         datas,
  //         request_id,
  //         chrome.i18n.getMessage('bgd_ops_broadcast'),
  //       ),
  //     );
  //   });
  // });
});
