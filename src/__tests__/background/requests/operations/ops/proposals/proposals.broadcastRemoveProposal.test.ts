import { broadcastRemoveProposal } from '@background/requests/operations/ops/proposals';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('proposals tests:\n', () => {
  const { methods, constants } = proposalsMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveProposal cases:\n', () => {
    it('Must return error if bad json format in proposal_ids', async () => {
      const error = 'Unexpected token ! in JSON at position 0';
      data.remove.proposal_ids = '!{}';
      data.remove.extensions = '{}';
      const result = await broadcastRemoveProposal(requestHandler, data.remove);
      methods.assert.error(result, new SyntaxError(error), data.remove, error);
    });
    it('Must return error if bad json format in extensions', async () => {
      const error = 'Unexpected token ! in JSON at position 0';
      data.remove.proposal_ids = '{}';
      data.remove.extensions = '!{!}';
      const result = await broadcastRemoveProposal(requestHandler, data.remove);
      methods.assert.error(result, new SyntaxError(error), data.remove, error);
    });
    it('Must return error if no key on handler', async () => {
      const error = 'private key should be a Buffer';
      data.remove.proposal_ids = '{}';
      data.remove.extensions = '{}';
      const result = await broadcastRemoveProposal(requestHandler, data.remove);
      methods.assert.error(result, new TypeError(error), data.remove, error);
    });
    it('Must return success', async () => {
      data.remove.proposal_ids = '{}';
      const ids = JSON.parse(data.remove.proposal_ids);
      data.remove.extensions = '{}';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastRemoveProposal(requestHandler, data.remove);
      methods.assert.success(
        result,
        data.remove,
        'bgd_ops_proposal_remove',
        ids,
      );
    });
  });
});
