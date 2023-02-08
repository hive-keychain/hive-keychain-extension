import { broadcastSendToken } from '@background/requests/operations/ops/send-token';
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
describe('send-token tests:\n', () => {
  const { methods, constants } = sendTokenMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const resultNoKey = (await broadcastSendToken(
      requestHandler,
      data,
    )) as ResultOperation;
    const { success, result, error, ...datas } = resultNoKey.msg;
    expect(success).toBe(false);
    expect(result).toBeUndefined();
    expect((error as TypeError).message).toContain('private key');
  });
  it('Must return success', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastSendToken(requestHandler, data);
    methods.assert.success(result, chrome.i18n.getMessage('bgd_ops_tokens'));
  });
});
