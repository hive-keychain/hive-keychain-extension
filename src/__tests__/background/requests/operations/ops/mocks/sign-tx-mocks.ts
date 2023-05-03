import LedgerModule from '@background/ledger.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { Operation, Transaction, TransactionConfirmation } from '@hiveio/dhive';
import { HiveTxConfirmationResult } from '@interfaces/hive-tx.interface';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestId,
  RequestSignTx,
} from '@interfaces/keychain.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const i18n = {
  get: (message: string, options?: string[]) =>
    mocksImplementation.i18nGetMessageCustom(message, options),
};

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.signTx,
  username: mk.user.one,
  tx: {
    ref_block_num: 1000,
    ref_block_prefix: 1,
    expiration: '12/12/2023',
    operations: [] as Operation[],
    extensions: [],
  } as Transaction,
  request_id: 1,
} as RequestSignTx & RequestId;

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const resultSignedTx = {
  ...data.tx,
  signatures: [
    '1f7dab58601505fdefc5c5c46a59b3eaf0258c529eb0edb14e882710b3dfc9e144387aba986d77fa1ab5074ad40abd09f361c0fd2f6346946752a5ef0a19beee96',
  ],
};

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  broadcastAndConfirmTransactionWithSignature: (
    result: HiveTxConfirmationResult,
  ) =>
    jest
      .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
      .mockResolvedValue(result),
  LedgerModule: {
    getSignatureFromLedger: (signature: string) =>
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValue(signature),
  },
  HiveTxUtils: {
    sendOperation: (result: HiveTxConfirmationResult) =>
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValue(result),
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
    success: (
      signedTx: any,
      data: KeychainRequestData & RequestId,
      message: string,
    ) => {
      const { request_id, ...datas } = data;
      expect(signedTx).toEqual(
        messages.success.answerSucess(
          resultSignedTx,
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
  i18n,
};

export default {
  methods,
  constants,
  mocks,
};
