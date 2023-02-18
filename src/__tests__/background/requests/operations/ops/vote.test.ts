import { broadcastVote } from '@background/requests/operations/ops/vote';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('vote tests:\n', () => {
  const { methods, constants } = voteMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const result = await broadcastVote(requestHandler, data);
    methods.assert.error(
      result,
      new Error('html_popup_error_while_signing_transaction'),
      data,
      mocksImplementation.i18nGetMessageCustom(
        'html_popup_error_while_signing_transaction',
      ),
    );
  });
  it('Must return success', async () => {
    const hiveTxSendOp = jest
      .spyOn(HiveTxUtils, 'sendOperation')
      .mockResolvedValue(true);
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
    hiveTxSendOp.mockRestore();
  });
});
