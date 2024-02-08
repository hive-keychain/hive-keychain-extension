import { broadcastVote } from '@background/requests/operations/ops/vote';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestVote,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('vote tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.vote,
    username: mk.user.one,
    permlink: 'https://link.hive',
    author: 'theghost1980',
    weight: 100,
  } as RequestVote & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  it('Must return error if no key on handler', async () => {
    const requestHandler = new RequestsHandler();
    const result = await broadcastVote(requestHandler, data);
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

  it('Must return success', async () => {
    jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
      id: 'id',
      confirmed: true,
      tx_id: 'tx_id',
    } as TransactionResult);
    const requestHandler = new RequestsHandler();
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastVote(requestHandler, data);
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
        message: chrome.i18n.getMessage('bgd_ops_vote', [
          data.author,
          data.permlink,
          +data.weight / 100 + '',
        ]),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
});
