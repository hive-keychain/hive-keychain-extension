import { RequestsHandler } from '@background/requests';
import {
  DynamicGlobalProperties,
  TransactionConfirmation,
} from '@hiveio/dhive';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestCreateProposal,
  RequestId,
  RequestRemoveProposal,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  create: {
    domain: 'domain',
    type: KeychainRequestTypes.createProposal,
    username: mk.user.one,
    receiver: 'keychain',
    subject: 'Create a keychain coin',
    permlink: 'http://hive-keychain.com/coin',
    start: '21/12/2022',
    end: '21/12/2024',
    daily_pay: '300 HBD',
    extensions: '',
    request_id: 1,
  } as RequestCreateProposal & RequestId,
  update: {
    domain: 'domain',
    type: KeychainRequestTypes.updateProposalVote,
    username: mk.user.one,
    proposal_ids: [1],
    approve: true,
    extensions: '',
    request_id: 1,
  } as RequestUpdateProposalVote & RequestId,
  remove: {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.removeProposal,
    proposal_ids: '',
    extensions: '',
    request_id: 1,
  } as RequestRemoveProposal & RequestId,
};

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
      getDynamicGlobalProperties: (data: DynamicGlobalProperties) =>
        (requestHandler.getHiveClient().database.getDynamicGlobalProperties =
          jest.fn().mockResolvedValue(data)),
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
    mocks.client.broadcast.sendOperations(confirmed);
    mocks.client.database.getDynamicGlobalProperties(dynamic.globalProperties);
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
          errorMessage,
          undefined,
        ),
      );
    },
    success: (result: any, data: any, keyMessage: string, ids: string) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          confirmed,
          datas,
          request_id,
          chrome.i18n.getMessage(keyMessage, [ids]),
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
};
