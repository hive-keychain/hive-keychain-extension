import { decodeMessage } from '@background/requests/operations/ops/decode-memo';
import { RequestsHandler } from '@background/requests/request-handler';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { AssertionError } from 'assert';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestDecode,
  RequestId,
} from 'hive-keychain-commons';
import memo from 'src/__tests__/utils-for-testing/data/memo';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('decode-memo tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.decode,
    message: '',
    method: KeychainKeyTypes.active,
    request_id: 1,
  } as RequestDecode & RequestId;

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

  it('Must return success and decoded memo', async () => {
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.encoded;
    const result = await decodeMessage(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        error: null,
        result: '# keychain tha best wallet!',
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_decode'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });

  it('Must return error if no key on handler', async () => {
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = undefined;
    data.message = memo._default.encoded;
    const result = await decodeMessage(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: new AssertionError({
          expected: true,
          operator: '==',
          message: 'private_key is required',
        }),
        result: null,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_decode_err'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
});
