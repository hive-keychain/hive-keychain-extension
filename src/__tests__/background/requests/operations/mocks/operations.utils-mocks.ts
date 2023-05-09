import { TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestSendToken,
} from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import { hiveTxConfirmation } from 'src/__tests__/utils-for-testing/data/confirmations';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.sendToken,
  username: mk.user.one,
  to: 'theghost1980',
  amount: '1000',
  memo: 'The Quan',
  currency: 'LEO',
} as RequestSendToken & RequestId;

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const message = {
  success: chrome.i18n.getMessage('bgd_ops_transfer_success', [
    data.amount,
    data.currency,
    data.username!,
    data.to,
  ]),
  error: (errorMsg: string) =>
    `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMsg}`,
  unknownError: () => chrome.i18n.getMessage('unknown_error'),
};

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
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
      result: any,
      error: Error,
      data: KeychainRequestData & RequestId,
      errorMessage: string,
    ) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.answerError(
          error,
          datas,
          request_id,
          message.error(errorMessage),
          undefined,
        ),
      );
    },
    success: (result: any, message: string) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          //TODO check bellow & fix!
          hiveTxConfirmation('tx_id', 'id', true),
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
  confirmed,
  message,
};

export default {
  methods,
  constants,
  mocks,
};
