import { encodeMessage } from '@background/requests/operations/ops/encode-memo';
import { RequestsHandler } from '@background/requests/request-handler';
import AccountUtils from '@hiveapp/utils/account.utils';
import * as MemoEncodeHiveJS from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import memo from 'src/__tests__/utils-for-testing/data/memo';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';

describe('encode-memo tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.encode,
    message: '',
    method: KeychainKeyTypes.memo,
    request_id: 1,
  } as RequestEncode & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('em-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  it('Must return error if no key on handler', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccount')
      .mockResolvedValue(accounts.extended);
    data.message = memo._default.decoded;
    const requestHandler = new RequestsHandler();
    const resultOperation = (await encodeMessage(
      requestHandler,
      data,
    )) as ResultOperation;
    const { success, result, error, ...datas } = resultOperation.msg;
    expect(success).toBe(false);
    expect(result).toBeNull();
    expect((error as TypeError).message).toContain('private_key');
  });

  it('Must return error if no receiver', async () => {
    AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(undefined);
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.decoded;
    const resultOperation = (await encodeMessage(
      requestHandler,
      data,
    )) as ResultOperation;
    const { success, result, error, ...datas } = resultOperation.msg;
    expect(success).toBe(false);
    expect(result).toBeNull();
    expect((error as TypeError).message).toContain('memo_key');
  });

  it('Must use memo_key if method as memo', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccount')
      .mockResolvedValue(accounts.extended);
    const sEncode = jest.spyOn(MemoEncodeHiveJS, 'encode');
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.decoded;
    await encodeMessage(requestHandler, data);
    expect(sEncode).toBeCalledWith(
      userData.one.nonEncryptKeys.memo,
      userData.one.encryptKeys.memo,
      data.message,
    );
  });

  it('Must use key_auths if method not memo', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccount')
      .mockResolvedValue(accounts.extended);
    const sEncode = jest.spyOn(MemoEncodeHiveJS, 'encode');
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.method = KeychainKeyTypes.posting;
    data.message = memo._default.decoded;
    await encodeMessage(requestHandler, data);
    expect(sEncode).toBeCalledWith(
      userData.one.nonEncryptKeys.memo,
      accounts.extended.posting.key_auths[0][0],
      data.message,
    );
  });

  it('Must return success', async () => {
    jest
      .spyOn(AccountUtils, 'getExtendedAccount')
      .mockResolvedValue(accounts.extended);
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.decoded;
    data.method = KeychainKeyTypes.memo;
    const result = await encodeMessage(requestHandler, data);
    const _newlyGenerated = result.msg.result;
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        error: null,
        result: _newlyGenerated,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_encode'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
});
