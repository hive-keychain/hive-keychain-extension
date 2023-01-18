import LedgerModule from '@background/ledger.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestBroadcast,
  RequestId,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/utils/account.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const i18n = {
  get: (message: string, options?: string[]) =>
    mocksImplementation.i18nGetMessageCustom(message, options),
};

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  username: mk.user.one,
  type: KeychainRequestTypes.broadcast,
  operations: 'transfer',
  method: KeychainKeyTypes.posting,
  request_id: 1,
} as RequestBroadcast & RequestId;
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
  broadcastAndConfirmTransactionWithSignature: (result: boolean) =>
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
    sendOperation: (result: boolean) =>
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
