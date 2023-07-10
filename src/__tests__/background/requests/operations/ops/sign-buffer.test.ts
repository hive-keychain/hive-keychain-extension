import {
  SignedBuffer,
  signBuffer,
} from '@background/requests/operations/ops/sign-buffer';
import { RequestsHandler } from '@background/requests/request-handler';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestId,
  RequestSignBuffer,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeychainError } from 'src/keychain-error';
import { KeysUtils } from 'src/utils/keys.utils';

describe('sign-buffer tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.signBuffer,
    username: mk.user.one,
    message: '',
    method: KeychainKeyTypes.active,
    title: 'title',
  } as RequestSignBuffer & RequestId;

  const signedMessage = {
    string:
      '20221a058cd7f8d541427066e326b968efdcf0632773ee4042f87a0f559b9b93d3293aeedc37d6a50565ff9b4a9cf78e684f8fe94a381e1ff146c00c48500535de',
    buffer:
      '20382cf71c9264cf5ac5feec1c3a4de25f73113bae496769603087dc63531fb0c676097d99da6c42c3ecde7297b73c2bf187e4e7982cb1cae663e414bfe31bc6b2',
  } as { string: string; buffer: SignedBuffer };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  it('Must call getUserKey', async () => {
    const requestHandler = new RequestsHandler();
    const sGetUserKeyPair = jest.spyOn(requestHandler, 'getUserKeyPair');
    await signBuffer(requestHandler, data);
    expect(sGetUserKeyPair).toBeCalledWith(
      data.username!,
      data.method.toLowerCase(),
    );
  });

  it('Must return success on string', async () => {
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    data.message = 'the key is very importat on HIVE';
    const signed = await signBuffer(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(signed).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        error: null,
        result: signedMessage.string,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_sign_success'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });

  it('Must return success on buffer', async () => {
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const _buffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    data.message = JSON.stringify(_buffer);
    const signed = await signBuffer(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(signed).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        error: null,
        result: signedMessage.buffer,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_sign_success'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });

  it('Must return error if no key on handler', async () => {
    const requestHandler = new RequestsHandler();
    requestHandler.getUserKeyPair = jest.fn().mockReturnValue([]);
    KeysUtils.isUsingLedger = jest.fn().mockReturnValue(true);
    const signed = await signBuffer(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(signed).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: new KeychainError('sign_buffer_ledger_error'),
        result: null,
        data: datas,
        message: chrome.i18n.getMessage('sign_buffer_ledger_error'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
});
