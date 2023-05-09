import LedgerModule from '@background/ledger.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestRecurrentTransfer,
} from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import { hiveTxConfirmation } from 'src/__tests__/utils-for-testing/data/confirmations';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import AccountUtils from 'src/utils/account.utils';

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
  getExtendedAccount: (account: ExtendedAccount | undefined) =>
    (AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(account)),
  //TODO bellow check & fix
  // broadcastAndConfirmTransactionWithSignature: (
  //   result: HiveTxConfirmationResult,
  // ) =>
  //   jest
  //     .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
  //     .mockResolvedValue(result),
  LedgerModule: {
    getSignatureFromLedger: (signature: string) =>
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValue(signature),
  },
  //TODO bellow check & fix
  // HiveTxUtils: {
  //   sendOperation: (result: HiveTxConfirmationResult) =>
  //     jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValue(result),
  // },
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
    success: (result: any, message: string) => {
      const { request_id, ...datas } = data;
      //TODO check bellow & fix!
      expect(result).toEqual(
        messages.success.answerSucess(
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
  requestHandler,
  confirmed,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
