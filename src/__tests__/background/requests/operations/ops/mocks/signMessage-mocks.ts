import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import { AssertionError } from 'assert';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.signBuffer,
  username: mk.user.one,
  message: '',
  method: KeychainKeyTypes.active,
  title: 'title',
} as RequestSignBuffer & RequestId;

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const signedMessage = {
  string:
    '20221a058cd7f8d541427066e326b968efdcf0632773ee4042f87a0f559b9b93d3293aeedc37d6a50565ff9b4a9cf78e684f8fe94a381e1ff146c00c48500535de',
  buffer:
    '20382cf71c9264cf5ac5feec1c3a4de25f73113bae496769603087dc63531fb0c676097d99da6c42c3ecde7297b73c2bf187e4e7982cb1cae663e414bfe31bc6b2',
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
  }),
  assert: {
    error: (
      signed: any,
      error: TypeError | SyntaxError | AssertionError,
      data: KeychainRequestData & RequestId,
      errorMessage: string,
      result: null | undefined,
    ) => {
      const { request_id, ...datas } = data;
      expect(signed).toEqual(
        messages.error.answerError(
          error,
          datas,
          request_id,
          errorMessage,
          result,
        ),
      );
    },
    success: (signed: any, message: string, result: string) => {
      const { request_id, ...datas } = data;
      expect(signed).toEqual(
        messages.success.answerSucess(result, datas, request_id, message, null),
      );
    },
  },
};

const constants = {
  data,
  requestHandler,
  confirmed,
  signedMessage,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
