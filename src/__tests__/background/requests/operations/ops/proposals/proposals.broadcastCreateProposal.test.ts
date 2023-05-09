import { broadcastCreateProposal } from '@background/requests/operations/ops/proposals';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
//TODO check bellow & fix!
describe('proposals tests:\n', () => {
  const { methods, constants, mocks } = proposalsMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastCreateProposal cases:\n', () => {
    describe('default cases:\n', () => {
      it('Must return error if bad json format', async () => {
        const errorMessage = 'Unexpected token ! in JSON at position 1';
        data.create.extensions = '{!}';
        requestHandler.data.key = userData.one.nonEncryptKeys.posting;
        const result = await broadcastCreateProposal(
          requestHandler,
          data.create,
        );
        methods.assert.error(
          result,
          new SyntaxError(errorMessage),
          data.create,
          errorMessage,
        );
      });
      it('Must return error if no key on handler', async () => {
        data.create.extensions = '{"keychain":10000,"points":6}';
        delete requestHandler.data.key;
        const result = await broadcastCreateProposal(
          requestHandler,
          data.create,
        );
        methods.assert.error(
          result,
          new Error('html_popup_error_while_signing_transaction'),
          data.create,
          mocksImplementation.i18nGetMessageCustom(
            'html_popup_error_while_signing_transaction',
          ),
        );
      });
      // it('Must return success', async () => {
      //   data.create.extensions = '{"keychain":10000,"points":6}';
      //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
      //   const mHiveTxSendOp = (HiveTxUtils.sendOperation = jest
      //     .fn()
      //     .mockResolvedValueOnce(transactionConfirmationSuccess));
      //   const result = await broadcastCreateProposal(
      //     requestHandler,
      //     data.create,
      //   );
      //   const { request_id, ...datas } = data.create;
      //   expect(result).toEqual(
      //     messages.success.answerSucess(
      //       transactionConfirmationSuccess,
      //       datas,
      //       request_id,
      //       chrome.i18n.getMessage('bgd_ops_proposal_create'),
      //       undefined,
      //     ),
      //   );
      //   mHiveTxSendOp.mockClear();
      //   mHiveTxSendOp.mockReset();
      // });
    });

    // describe('using ledger cases:\n', () => {
    //   it('Must return success', async () => {
    //     data.create.extensions = '{"keychain":10000,"points":6}';
    //     requestHandler.data.key = '#keyUsingLedger1234';
    //     mocks.LedgerModule.getSignatureFromLedger('signed!');
    //     mocks.broadcastAndConfirmTransactionWithSignature(
    //       transactionConfirmationSuccess,
    //     );
    //     const result = await broadcastCreateProposal(
    //       requestHandler,
    //       data.create,
    //     );
    //     const { request_id, ...datas } = data.create;
    //     expect(result).toEqual(
    //       messages.success.answerSucess(
    //         transactionConfirmationSuccess,
    //         datas,
    //         request_id,
    //         chrome.i18n.getMessage('bgd_ops_proposal_create'),
    //         undefined,
    //       ),
    //     );
    //   });
    // });
  });
});
