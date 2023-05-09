import { broadcastWitnessVote } from '@background/requests/operations/ops/witness-vote';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import witnessVoteMocks from 'src/__tests__/background/requests/operations/ops/mocks/witness-vote-mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
//TODO bellow check & fix!
describe('witness-vote tests:\n', () => {
  const { methods, constants, spies, mocks } = witnessVoteMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Default cases:\n', () => {
    it('Must call getUserKey', async () => {
      await broadcastWitnessVote(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.active,
      );
    });
    it('Must return error if no key on handler', async () => {
      const result = await broadcastWitnessVote(requestHandler, data);
      methods.assert.error(
        result,
        new Error('html_popup_error_while_signing_transaction'),
        data,
        mocksImplementation.i18nGetMessageCustom(
          'html_popup_error_while_signing_transaction',
        ),
      );
    });
    // it('Must return success when vote', async () => {
    //   mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
    //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
    //   const result = await broadcastWitnessVote(requestHandler, data);
    //   methods.assert.success(
    //     result,
    //     chrome.i18n.getMessage('bgd_ops_witness_voted', [data.witness]),
    //   );
    // });
    // it('Must return success when unvote', async () => {
    //   mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
    //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
    //   data.vote = false;
    //   const result = await broadcastWitnessVote(requestHandler, data);
    //   methods.assert.success(
    //     result,
    //     chrome.i18n.getMessage('bgd_ops_witness_unvoted', [data.witness]),
    //   );
    // });
  });

  // describe('Using ledger cases:\n', () => {
  //   it('Must return success when vote', async () => {
  //     mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
  //     mocks.LedgerModule.getSignatureFromLedger('signed!');
  //     mocks.broadcastAndConfirmTransactionWithSignature(
  //       transactionConfirmationSuccess,
  //     );
  //     requestHandler.data.key = '#ledgerKEY';
  //     data.vote = true;
  //     const result = await broadcastWitnessVote(requestHandler, data);
  //     methods.assert.success(
  //       result,
  //       chrome.i18n.getMessage('bgd_ops_witness_voted', [data.witness]),
  //     );
  //   });
  // });
});
