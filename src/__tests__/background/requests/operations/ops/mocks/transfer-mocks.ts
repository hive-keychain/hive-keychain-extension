import { RequestsHandler } from '@background/requests';
import { TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.transfer,
  username: mk.user.one,
  to: 'theghost1980',
  amount: '100000.000',
  memo: '',
  enforce: false,
  currency: 'HIVE',
  request_id: 1,
} as RequestTransfer & RequestId;

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const params = {
  getUserKey: [
    [data.username!, KeychainKeyTypesLC.memo],
    [data.username!, KeychainKeyTypesLC.active],
  ],
};

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
};

const spies = {
  getUserKey: jest.spyOn(requestHandler, 'getUserKeyPair'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
    //TODO rm comments
    // mocks.client.broadcast.transfer('success', confirmed);
    // mocks.client.database.getAccounts([]);
  }),
  assert: {
    error: (
      result: any,
      error: TypeError | SyntaxError,
      data: KeychainRequestData & RequestId,
      message: string,
    ) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.answerError(
          error,
          datas,
          request_id,
          message,
          undefined,
        ),
      );
    },
    success: (result: any, message: string) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          confirmed,
          datas,
          request_id,
          message,
          undefined,
        ),
      );
    },
  },
};

const constants = {
  data,
  requestHandler,
  confirmed,
  params,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
