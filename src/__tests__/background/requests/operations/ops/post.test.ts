import { broadcastPost } from '@background/requests/operations/ops/post';
import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestPost,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

describe('post tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.post,
    title: 'title',
    body: 'body_stringyfied',
    parent_perm: 'https://hive.com/perm-link/',
    parent_username: 'theghost1980',
    json_metadata: 'metadata_stringyfied',
    permlink: 'https://hive.com/perm-link-1/',
    comment_options: '',
    request_id: 1,
  } as RequestPost & RequestId;

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
    const requestHandler = new RequestsHandler();
    const result = await broadcastPost(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: new Error('html_popup_error_while_signing_transaction'),
        result: undefined,
        data: datas,
        message: chrome.i18n.getMessage(
          'html_popup_error_while_signing_transaction',
        ),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });

  it('Must return error if no key prop in data', async () => {
    const requestHandler = new RequestsHandler();
    delete requestHandler.data.key;
    data.comment_options = '{"keychain":10000,"points":6}';
    const result = await broadcastPost(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: new Error('html_popup_error_while_signing_transaction'),
        result: undefined,
        data: datas,
        message: chrome.i18n.getMessage(
          'html_popup_error_while_signing_transaction',
        ),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });

  describe('Empty comment_options:\n', () => {
    it('Must return success', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      const result = await broadcastPost(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_post'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('With comment_options:\n', () => {
    it('Must return error if bad json', async () => {
      data.comment_options = '!{!}';
      const requestHandler = new RequestsHandler();
      const resultOperation = (await broadcastPost(
        requestHandler,
        data,
      )) as ResultOperation;
      const { success, result, error } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('JSON');
    });

    it('Must return success', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.posting;
      data.comment_options = '{"keychain":10000,"points":6}';
      const result = await broadcastPost(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_post'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
