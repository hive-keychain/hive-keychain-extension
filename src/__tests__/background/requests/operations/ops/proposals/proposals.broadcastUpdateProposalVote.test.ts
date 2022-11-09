import { broadcastUpdateProposalVote } from '@background/requests/operations/ops/proposals';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('proposals tests:\n', () => {
  const { methods, constants } = proposalsMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastUpdateProposalVote cases:\n', () => {
    it('Must return error if bad json format in extensions', async () => {
      const errorMessage = 'Unexpected token ! in JSON at position 1';
      data.update.proposal_ids = [];
      data.update.extensions = '{!}';
      const result = await broadcastUpdateProposalVote(
        requestHandler,
        data.update,
      );
      methods.assert.error(
        result,
        new SyntaxError(errorMessage),
        data.update,
        errorMessage,
      );
    });
    it('Must return error if no key on handler', async () => {
      const errorMessage = 'private key should be a Buffer';
      data.update.proposal_ids = [];
      data.update.extensions = [];
      const result = await broadcastUpdateProposalVote(
        requestHandler,
        data.update,
      );
      methods.assert.error(
        result,
        new TypeError(errorMessage),
        data.update,
        errorMessage,
      );
    });
    it('Must return success on approvals', async () => {
      data.update.proposal_ids = [1, 2];
      data.update.extensions = [1, 2];
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
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
    it('Must return success on approval', async () => {
      data.update.proposal_ids = [1];
      data.update.extensions = [1, 2];
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastUpdateProposalVote(
        requestHandler,
        data.update,
      );
      const ids = data.update.proposal_ids[0].toString();
      methods.assert.success(result, data.update, 'bgd_ops_proposal_vote', ids);
    });
    it('Must return success on disapprovals', async () => {
      data.update.proposal_ids = [1, 2];
      data.update.extensions = [1, 2];
      data.update.approve = false;
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
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
});
