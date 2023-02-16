import { broadcastUpdateProposalVote } from '@background/requests/operations/ops/proposals';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('proposals tests:\n', () => {
  const { methods, constants, mocks } = proposalsMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastUpdateProposalVote cases:\n', () => {
    describe('default cases:\n', () => {
      it('Must return error if no key on handler', async () => {
        data.update.proposal_ids = [];
        data.update.extensions = [];
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        methods.assert.error(
          result,
          new Error('html_popup_error_while_signing_transaction'),
          data.update,
          mocksImplementation.i18nGetMessageCustom(
            'html_popup_error_while_signing_transaction',
          ),
        );
      });
      it('Must return success on approvals', async () => {
        data.update.proposal_ids = [1, 2];
        data.update.extensions = [1, 2];
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        mocks.HiveTxUtils.sendOperation(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids.join(', #');
        methods.assert.success(
          result,
          data.update,
          'bgd_ops_proposal_votes',
          ids,
        );
      });
      it('Must return success on approvals using proposal_ids as json', async () => {
        data.update.proposal_ids = '[1]';
        const ids_parsed = JSON.parse(data.update.proposal_ids);
        data.update.extensions = [1, 2];
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        mocks.HiveTxUtils.sendOperation(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
        expect(result).toEqual(
          messages.success.answerSucess(
            true,
            datas,
            request_id,
            chrome.i18n.getMessage(
              'bgd_ops_proposal_vote',
              ids_parsed.join(', #'),
            ),
            undefined,
          ),
        );
      });
      it('Must return success on approval', async () => {
        data.update.proposal_ids = [1];
        data.update.extensions = [1, 2];
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        mocks.HiveTxUtils.sendOperation(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids[0].toString();
        methods.assert.success(
          result,
          data.update,
          'bgd_ops_proposal_vote',
          ids,
        );
      });
      it('Must return success on disapprovals', async () => {
        data.update.proposal_ids = [1, 2];
        data.update.extensions = [1, 2];
        data.update.approve = false;
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        mocks.HiveTxUtils.sendOperation(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids.join(', #');
        methods.assert.success(
          result,
          data.update,
          'bgd_ops_proposal_unvotes',
          ids,
        );
      });
      it('Must return success on disapproval', async () => {
        data.update.proposal_ids = [1];
        data.update.extensions = [1, 2];
        data.update.approve = false;
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        mocks.HiveTxUtils.sendOperation(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const ids = data.update.proposal_ids[0].toString();
        methods.assert.success(
          result,
          data.update,
          'bgd_ops_proposal_unvote',
          ids,
        );
      });
    });

    describe('Using Ledger cases:\n', () => {
      it('Must return success using proposal_ids as object', async () => {
        data.update.extensions = '{"keychain":10000,"points":6}';
        data.update.approve = true;
        requestHandler.data.key = '#keyUsingLedger1234';
        mocks.LedgerModule.getSignatureFromLedger('signed!');
        mocks.broadcastAndConfirmTransactionWithSignature(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
        expect(result).toEqual(
          messages.success.answerSucess(
            true,
            datas,
            request_id,
            chrome.i18n.getMessage('bgd_ops_proposal_vote', [
              datas.proposal_ids[0].toString(),
            ]),
            undefined,
          ),
        );
      });

      it('Must return success using proposal_ids as string', async () => {
        data.update.extensions = '{"keychain":10000,"points":6}';
        data.update.proposal_ids = '[1]';
        data.update.approve = true;
        requestHandler.data.key = '#keyUsingLedger1234';
        mocks.LedgerModule.getSignatureFromLedger('signed!');
        mocks.broadcastAndConfirmTransactionWithSignature(true);
        const result = await broadcastUpdateProposalVote(
          requestHandler,
          data.update,
        );
        const { request_id, ...datas } = data.update;
        expect(result).toEqual(
          messages.success.answerSucess(
            true,
            datas,
            request_id,
            chrome.i18n.getMessage('bgd_ops_proposal_vote', ['1']),
            undefined,
          ),
        );
      });
    });
  });
});
