import { broadcastSendToken } from '@background/requests/operations/ops/send-token';
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('send-token tests:\n', () => {
  const { methods, constants } = sendTokenMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const error = chrome.i18n.getMessage('bgd_ops_error_broadcasting');
    const result = await broadcastSendToken(requestHandler, data);
    methods.assert.error(
      result,
      new TypeError('private key should be a Buffer'),
      data,
      error,
    );
  });
  it('Must return success', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastSendToken(requestHandler, data);
    methods.assert.success(result, chrome.i18n.getMessage('bgd_ops_tokens'));
  });
});
