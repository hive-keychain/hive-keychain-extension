import { broadcastRemoveProposal } from '@background/requests/operations/ops/proposals';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('proposals tests:\n', () => {
  const { methods, constants, mocks } = proposalsMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveProposal cases:\n', () => {
    describe('default cases:\n', () => {
      it('Must return error if bad json format in proposal_ids', async () => {
        const error = 'Unexpected token ! in JSON at position 0';
        data.remove.proposal_ids = '!{}';
        data.remove.extensions = '{}';
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        methods.assert.error(
          result,
          new SyntaxError(error),
          data.remove,
          error,
        );
      });
      it('Must return error if bad json format in extensions', async () => {
        const error = 'Unexpected token ! in JSON at position 0';
        data.remove.proposal_ids = '{}';
        data.remove.extensions = '!{!}';
        requestHandler.data.key = userData.one.nonEncryptKeys.posting;
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        methods.assert.error(
          result,
          new SyntaxError(error),
          data.remove,
          error,
        );
      });
      it('Must return error if no key on handler', async () => {
        data.remove.proposal_ids = '{}';
        data.remove.extensions = '{}';
        delete requestHandler.data.key;
        const result = await broadcastRemoveProposal(
          requestHandler,
          data.remove,
        );
        methods.assert.error(
          result,
          new Error('html_popup_error_while_signing_transaction'),
          data.remove,
          mocksImplementation.i18nGetMessageCustom(
            'html_popup_error_while_signing_transaction',
          ),
        );
      });
      //TODO check bellow & fix.
      // it('Must return success', async () => {
      //   const mhiveTxSendOp = jest
      //     .spyOn(HiveTxUtils, 'sendOperation')
      //     .mockResolvedValue(transactionConfirmationSuccess);
      //   data.remove.proposal_ids = '{}';
      //   const ids = JSON.parse(data.remove.proposal_ids);
      //   data.remove.extensions = '{}';
      //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
      //   const result = await broadcastRemoveProposal(
      //     requestHandler,
      //     data.remove,
      //   );
      //   methods.assert.success(
      //     result,
      //     data.remove,
      //     'bgd_ops_proposal_remove',
      //     ids,
      //   );
      //   mhiveTxSendOp.mockRestore();
      // });
    });

    // describe('Using Ledger cases:\n', () => {
    //   it('Must return success using proposal_ids as json', async () => {
    //     mocks.LedgerModule.getSignatureFromLedger('signed!');
    //     mocks.broadcastAndConfirmTransactionWithSignature(
    //       transactionConfirmationSuccess,
    //     );
    //     data.remove.proposal_ids = '{}';
    //     const ids = JSON.parse(data.remove.proposal_ids);
    //     data.remove.extensions = '{}';
    //     requestHandler.data.key = '#ledgerKey1234';
    //     const result = await broadcastRemoveProposal(
    //       requestHandler,
    //       data.remove,
    //     );
    //     methods.assert.success(
    //       result,
    //       data.remove,
    //       'bgd_ops_proposal_remove',
    //       ids,
    //     );
    //   });

    //   it('Must return success using proposal_ids as object', async () => {
    //     mocks.LedgerModule.getSignatureFromLedger('signed!');
    //     mocks.broadcastAndConfirmTransactionWithSignature(
    //       transactionConfirmationSuccess,
    //     );
    //     data.remove.proposal_ids = [1];
    //     data.remove.extensions = '{}';
    //     requestHandler.data.key = '#ledgerKey1234';
    //     const result = await broadcastRemoveProposal(
    //       requestHandler,
    //       data.remove,
    //     );
    //     methods.assert.success(
    //       result,
    //       data.remove,
    //       'bgd_ops_proposal_remove',
    //       '1',
    //     );
    //   });
    // });
  });
});
