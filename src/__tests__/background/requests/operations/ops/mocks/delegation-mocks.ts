import { RequestsHandler } from '@background/requests';
import { TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainRequestTypes,
  RequestDelegation,
  RequestId,
} from '@interfaces/keychain.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();
const data = {
  domain: 'domain',
  username: mk.user.one,
  type: KeychainRequestTypes.delegation,
  delegatee: 'theghost1980',
  amount: '100.000',
  unit: 'HP',
  request_id: 1,
} as RequestDelegation & RequestId;
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
    // TODO rm comments when finish fix tests
    // mocks.client.broadcast.delegateVestingShares(confirmed);
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
