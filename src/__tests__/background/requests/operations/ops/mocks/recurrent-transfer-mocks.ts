import { RequestsHandler } from '@background/requests';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestRecurrentTransfer,
} from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.recurrentTransfer,
  username: mk.user.one,
  to: 'theghost1980',
  amount: '1000',
  currency: 'hbd',
  memo: '',
  recurrence: 1,
  executions: 1,
} as RequestRecurrentTransfer & RequestId;

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
      sendOperations: (id: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValue(id)),
    },
    database: {
      getAccounts: (receiverAccount: ExtendedAccount[]) =>
        (requestHandler.getHiveClient().database.getAccounts = jest
          .fn()
          .mockResolvedValue(receiverAccount)),
    },
  },
};

const spies = {
  getUserKey: jest.spyOn(requestHandler, 'getUserKey'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
    mocks.client.broadcast.sendOperations(confirmed);
    mocks.client.database.getAccounts([]);
  }),
  assert: {
    error: (
      result: any,
      error: TypeError | SyntaxError,
      data: KeychainRequestData & RequestId,
      errorMessage: string,
    ) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.answerError(
          error,
          datas,
          request_id,
          `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMessage}`,
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
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
