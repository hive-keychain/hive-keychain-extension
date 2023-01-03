import { broadcastCreateProposal } from '@background/requests/operations/ops/proposals';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('proposals tests:\n', () => {
  const { methods, constants } = proposalsMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastCreateProposal cases:\n', () => {
    it('Must return error if bad json format', async () => {
      const errorMessage = 'Unexpected token ! in JSON at position 1';
      data.create.extensions = '{!}';
      const result = await broadcastCreateProposal(requestHandler, data.create);
      methods.assert.error(
        result,
        new SyntaxError(errorMessage),
        data.create,
        errorMessage,
      );
    });
    it('Must return error if no key on handler', async () => {
      const errorMessage =
        "Cannot read properties of undefined (reading 'toString')";
      data.create.extensions = '{"keychain":10000,"points":6}';
      const result = await broadcastCreateProposal(requestHandler, data.create);
      methods.assert.error(
        result,
        new TypeError(errorMessage),
        data.create,
        errorMessage,
      );
    });
    it('Must return success', async () => {
      data.create.extensions = '{"keychain":10000,"points":6}';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const mHiveTxSendOp = (HiveTxUtils.sendOperation = jest
        .fn()
        .mockResolvedValueOnce(true));
      const result = await broadcastCreateProposal(requestHandler, data.create);
      const { request_id, ...datas } = data.create;
      expect(result).toEqual(
        messages.success.answerSucess(
          true,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_proposal_create'),
          undefined,
        ),
      );
      mHiveTxSendOp.mockClear();
      mHiveTxSendOp.mockReset();
    });
  });
});
