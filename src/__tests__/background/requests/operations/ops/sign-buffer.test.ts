import { signBuffer } from '@background/requests/operations/ops/sign-buffer';
import signMessageMocks from 'src/__tests__/background/requests/operations/ops/mocks/signMessage-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('sign-buffer tests:\n', () => {
  const { methods, constants, spies } = signMessageMocks;
  const { requestHandler, data, signedMessage } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call getUserKey', async () => {
    await signBuffer(requestHandler, data);
    expect(spies.getUserKey).toBeCalledWith(
      data.username!,
      data.method.toLowerCase(),
    );
  });
  it('Must return error if no key on handler', async () => {
    const errorMessage =
      "Cannot read properties of undefined (reading 'toString')";
    const signed = await signBuffer(requestHandler, data);
    methods.assert.error(
      signed,
      new TypeError(errorMessage),
      data,
      errorMessage,
      null,
    );
  });
  it('Must return success on string', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    data.message = 'the key is very importat on HIVE';
    const signed = await signBuffer(requestHandler, data);
    methods.assert.success(
      signed,
      chrome.i18n.getMessage('bgd_ops_sign_success'),
      signedMessage.string,
    );
  });
  it('Must return success on buffer', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const _buffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    data.message = JSON.stringify(_buffer);
    const signed = await signBuffer(requestHandler, data);
    methods.assert.success(
      signed,
      chrome.i18n.getMessage('bgd_ops_sign_success'),
      signedMessage.buffer,
    );
  });
});
