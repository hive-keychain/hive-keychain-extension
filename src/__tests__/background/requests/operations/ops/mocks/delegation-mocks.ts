import { RequestsHandler } from '@background/requests';
import {
  DynamicGlobalProperties,
  TransactionConfirmation,
} from '@hiveio/dhive';
import { RequestDelegation, RequestId } from '@interfaces/keychain.interface';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();
const data = {
  ...keychainRequest.wValues.delegation,
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
  client: {
    broadcast: {
      delegateVestingShares: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.delegateVestingShares = jest
          .fn()
          .mockResolvedValue(result)),
    },
    database: {
      getDynamicGlobalProperties: (globalProps: DynamicGlobalProperties) =>
        (requestHandler.getHiveClient().database.getDynamicGlobalProperties =
          jest.fn().mockResolvedValue(globalProps)),
    },
  },
};

const spies = {
  getUserKey: jest.spyOn(requestHandler, 'getUserKey'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
    mocks.client.broadcast.delegateVestingShares(confirmed);
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
