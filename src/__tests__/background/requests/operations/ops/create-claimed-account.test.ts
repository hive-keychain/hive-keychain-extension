import { broadcastCreateClaimedAccount } from '@background/requests/operations/ops/create-claimed-account';
import createClaimedAccount from 'src/__tests__/background/requests/operations/ops/mocks/create-claimed-account';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import config from 'src/__tests__/utils-for-testing/setups/config';
//TODO check & fix tsts bellow!
describe('create-claimed-account tests:\n', () => {
  config.byDefault();
  const { methods, constants, mocks } = createClaimedAccount;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Default cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const result = await broadcastCreateClaimedAccount(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.keyBuffer(
          datas,
          request_id,
          new Error('html_popup_error_while_signing_transaction'),
          mocksImplementation.i18nGetMessageCustom(
            'html_popup_error_while_signing_transaction',
          ),
        ),
      );
    });
    // it('Must return success on claimed account', async () => {
    //   const mHiveTxSendOp = jest
    //     .spyOn(HiveTxUtils, 'sendOperation')
    //     .mockResolvedValueOnce(transactionConfirmationSuccess);
    //   requestHandler.setKeys(
    //     userData.one.nonEncryptKeys.active,
    //     userData.one.encryptKeys.active,
    //   );
    //   const result = await broadcastCreateClaimedAccount(requestHandler, data);
    //   const { request_id, ...datas } = data;
    //   expect(result).toEqual(
    //     messages.success.broadcast(
    //       transactionConfirmationFailed,
    //       datas,
    //       request_id,
    //       chrome.i18n.getMessage('bgd_ops_create_account', [data.new_account]),
    //     ),
    //   );
    //   mHiveTxSendOp.mockRestore();
    // });
  });

  // describe('Using ledger cases:\n', () => {
  //   it('Must return success on claimed account', async () => {
  //     mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
  //     mocks.broadcastAndConfirmTransactionWithSignature(
  //       transactionConfirmationSuccess,
  //     );
  //     mocks.LedgerModule.getSignatureFromLedger('signed!');
  //     requestHandler.setKeys(
  //       '#LedgerKeyHere1234',
  //       userData.one.encryptKeys.active,
  //     );
  //     const result = await broadcastCreateClaimedAccount(requestHandler, data);
  //     const { request_id, ...datas } = data;
  //     expect(result).toEqual(
  //       messages.success.broadcast(
  //         transactionConfirmationSuccess,
  //         datas,
  //         request_id,
  //         chrome.i18n.getMessage('bgd_ops_create_account', [data.new_account]),
  //       ),
  //     );
  //   });
  // });
});
