import { RequestsHandler } from '@background/requests';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestTypes,
  RequestConvert,
  RequestId,
} from '@interfaces/keychain.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();
const data = {
  type: KeychainRequestTypes.convert,
  amount: '0.1',
  collaterized: false,
  domain: 'domain',
  username: mk.user.one,
  request_id: 1,
} as RequestConvert & RequestId;
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
    database: {
      getAccounts: (result: ExtendedAccount[]) =>
        (requestHandler.getHiveClient().database.getAccounts = jest
          .fn()
          .mockResolvedValue(result)),
      call: (
        conversions: { requestid: number }[],
        collaterized: { requestid: number }[],
      ) =>
        (requestHandler.getHiveClient().database.call = jest
          .fn()
          .mockResolvedValueOnce(conversions)
          .mockResolvedValueOnce(collaterized)),
    },
    broadcast: {
      sendOperations: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValue(result)),
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
