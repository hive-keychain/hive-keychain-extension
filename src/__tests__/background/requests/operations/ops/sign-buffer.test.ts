import { signBuffer } from '@background/requests/operations/ops/sign-buffer';
import { RequestsHandler } from '@background/requests/request-handler';
import signMessageMocks from 'src/__tests__/background/requests/operations/ops/mocks/signMessage-mocks';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeychainError } from 'src/keychain-error';
import { KeysUtils } from 'src/utils/keys.utils';
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
  //TODO check & fix tests bellow!
  // it('Must return success on string', async () => {
  //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
  //   data.message = 'the key is very importat on HIVE';
  //   const signed = await signBuffer(requestHandler, data);
  //   methods.assert.success(
  //     signed,
  //     chrome.i18n.getMessage('bgd_ops_sign_success'),
  //     signedMessage.string,
  //   );
  // });
  // it('Must return success on buffer', async () => {
  //   requestHandler.data.key = userData.one.nonEncryptKeys.active;
  //   const _buffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
  //   data.message = JSON.stringify(_buffer);
  //   const signed = await signBuffer(requestHandler, data);
  //   methods.assert.success(
  //     signed,
  //     chrome.i18n.getMessage('bgd_ops_sign_success'),
  //     signedMessage.buffer,
  //   );
  // });
  it('Must return error if no key on handler', async () => {
    const requestHandlerCloned = objects.clone(
      requestHandler,
    ) as RequestsHandler;
    delete requestHandlerCloned.data.key;
    requestHandlerCloned.getUserKeyPair = jest.fn().mockReturnValue([]);
    KeysUtils.isUsingLedger = jest.fn().mockReturnValue(true);
    const signed = await signBuffer(requestHandlerCloned, data);
    methods.assert.error(
      signed,
      new KeychainError('sign_buffer_ledger_error'),
      data,
      mocksImplementation.i18nGetMessageCustom('sign_buffer_ledger_error'),
      null,
    );
  });
});
