import { RequestsHandler } from '@background/requests/request-handler';
import { AuthorityType, TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestTypes,
  RequestCreateClaimedAccount,
  RequestId,
} from '@interfaces/keychain.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const authType = {
  weight_threshold: 1,
  account_auths: [],
  key_auths: [],
} as AuthorityType;

const data = {
  domain: 'domain',
  username: mk.user.one,
  type: KeychainRequestTypes.createClaimedAccount,
  new_account: 'new_account',
  owner: JSON.stringify(authType),
  active: JSON.stringify(authType),
  posting: JSON.stringify(authType),
  memo: JSON.stringify(authType),
  request_id: 1,
} as RequestCreateClaimedAccount & RequestId;
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
