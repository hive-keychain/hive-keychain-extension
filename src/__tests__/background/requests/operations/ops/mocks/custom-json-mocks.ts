import LedgerModule from '@background/ledger.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionConfirmation } from '@hiveio/dhive';
import { HiveTxConfirmationResult } from '@interfaces/hive-tx.interface';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  username: mk.user.one,
  type: KeychainRequestTypes.custom,
  id: '1',
  json: JSON.stringify({
    command: 'send_tokens',
    amount: 1,
  }),
  display_msg: 'display_msg',
  method: KeychainKeyTypes.active,
  request_id: 1,
} as RequestCustomJSON & RequestId;
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
