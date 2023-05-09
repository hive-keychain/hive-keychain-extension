import { broadcastProxy } from '@background/requests/operations/ops/proxy';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import proxyMocks from 'src/__tests__/background/requests/operations/ops/mocks/proxy-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
//TODO check & fix tests bellow
describe('proxy tests:\n', () => {
  const { methods, constants, spies, mocks } = proxyMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastProxy cases:\n', () => {
    describe('Default cases:\n', () => {
      it('Must call getUserKey', async () => {
        await broadcastProxy(requestHandler, data);
        expect(spies.getUserKey).toBeCalledWith(
          data.username!,
          KeychainKeyTypesLC.active,
        );
      });
      it('Must return error if no key on handler', async () => {
        delete data.username;
        const result = await broadcastProxy(requestHandler, data);
        methods.assert.error(
          result,
          new Error('html_popup_error_while_signing_transaction'),
          data,
          mocksImplementation.i18nGetMessageCustom(
            'html_popup_error_while_signing_transaction',
          ),
        );
      });
      // it('Must return success on removing proxy', async () => {
      //   mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
      //   data.username = userData.one.username;
      //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
      //   const result = await broadcastProxy(requestHandler, data);
      //   const { request_id, ...datas } = data;
      //   expect(result).toEqual(
      //     messages.success.answerSucess(
      //       transactionConfirmationSuccess,
      //       datas,
      //       request_id,
      //       chrome.i18n.getMessage('bgd_ops_unproxy'),
      //       undefined,
      //     ),
      //   );
      // });
      // it('Must return success on setting proxy', async () => {
      //   mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
      //   data.username = userData.one.username;
      //   data.proxy = 'keychain';
      //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
      //   const result = await broadcastProxy(requestHandler, data);
      //   const { request_id, ...datas } = data;
      //   expect(result).toEqual(
      //     messages.success.answerSucess(
      //       transactionConfirmationSuccess,
      //       datas,
      //       request_id,
      //       chrome.i18n.getMessage('popup_success_proxy', [data.proxy]),
      //       undefined,
      //     ),
      //   );
      // });
    });

    // describe('Using ledger cases:\n', () => {
    //   it('Must return success on setting proxy', async () => {
    //     mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
    //     mocks.LedgerModule.getSignatureFromLedger('signed!');
    //     mocks.broadcastAndConfirmTransactionWithSignature(
    //       transactionConfirmationSuccess,
    //     );
    //     data.username = userData.one.username;
    //     data.proxy = 'keychain';
    //     requestHandler.data.key = '#ledgerKEY!@#$';
    //     const result = await broadcastProxy(requestHandler, data);
    //     const { request_id, ...datas } = data;
    //     expect(result).toEqual(
    //       messages.success.answerSucess(
    //         transactionConfirmationSuccess,
    //         datas,
    //         request_id,
    //         chrome.i18n.getMessage('popup_success_proxy', [data.proxy]),
    //         undefined,
    //       ),
    //     );
    //   });
    // });
  });
});
