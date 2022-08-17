import { RequestsHandler } from '@background/requests';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import * as MemoEncodeHiveJS from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  domain: 'domain',
  username: mk.user.one,
  type: KeychainRequestTypes.encode,
  message: '',
  method: KeychainKeyTypes.memo,
  request_id: 1,
} as RequestEncode & RequestId;

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
      getAccounts: (receiverAccount: ExtendedAccount[]) =>
        (requestHandler.getHiveClient().database.getAccounts = jest
          .fn()
          .mockResolvedValue(receiverAccount)),
    },
  },
};

const spies = {
  encode: jest.spyOn(MemoEncodeHiveJS, 'encode'),
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
