import { broadcastVote } from '@background/requests/operations/ops/vote';
import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('vote tests:\n', () => {
  const { methods, constants } = voteMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const error = 'private key should be a Buffer';
    const result = await broadcastVote(requestHandler, data);
    methods.assert.error(result, new TypeError(error), data, error);
  });
  it('Must return success', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastVote(requestHandler, data);
    methods.assert.success(
      result,
      chrome.i18n.getMessage('bgd_ops_vote', [
        data.author,
        data.permlink,
        +data.weight / 100 + '',
      ]),
    );
  });
});
