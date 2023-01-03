import { RequestsHandler } from '@background/requests';
import { TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestPost,
} from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

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

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  client: {
    broadcast: {
      comment: (id: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.comment = jest
          .fn()
          .mockResolvedValue(id)),
      sendOperations: (id: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValue(id)),
    },
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
  }),
  assertMsgSucess: (
    result: any,
    data: KeychainRequestData & RequestId,
    messageKey: string,
  ) => {
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.answerSucess(
        true,
        datas,
        request_id,
        chrome.i18n.getMessage(messageKey),
        undefined,
      ),
    );
  },
  assertMsgError: (
    result: any,
    error: Error | TypeError | SyntaxError,
    data: KeychainRequestData & RequestId,
    message: string,
  ) => {
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.error.answerError(error, datas, request_id, message, undefined),
    );
  },
};

const constants = {
  data,
  requestHandler,
};

export default {
  methods,
  constants,
  mocks,
};
