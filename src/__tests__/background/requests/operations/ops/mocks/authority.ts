import { RequestsHandler } from '@background/requests';
import { TransactionConfirmation } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestAddAccountAuthority,
  RequestAddKeyAuthority,
  RequestId,
  RequestRemoveAccountAuthority,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/utils/account.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const commonValues = {
  domain: 'domain',
  username: mk.user.one,
};

const requestHandler = new RequestsHandler();

const data = {
  addAccountAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.addAccountAuthority,
    role: KeychainKeyTypes.posting,
    weight: 1,
    authorizedUsername: 'theghost1980',
    request_id: 1,
  } as RequestAddAccountAuthority & RequestId,
  removeAccountAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.removeAccountAuthority,
    authorizedUsername: 'theghost1980',
    role: KeychainKeyTypes.posting,
    method: KeychainKeyTypes.active,
    request_id: 1,
  } as RequestRemoveAccountAuthority & RequestId,
  addKeyAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.addKeyAuthority,
    authorizedKey: userData.one.encryptKeys.posting,
    method: KeychainKeyTypes.active,
    weight: 1,
    role: KeychainKeyTypes.posting,
    request_id: 1,
  } as RequestAddKeyAuthority & RequestId,
  removeKeyAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.removeKeyAuthority,
    authorizedKey: userData.one.encryptKeys.posting,
    method: KeychainKeyTypes.active,
    role: KeychainKeyTypes.posting,
    request_id: 1,
  } as RequestRemoveKeyAuthority & RequestId,
};
const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const spies = {
  saveAccounts: jest
    .spyOn(AccountUtils, 'saveAccounts')
    .mockResolvedValue(undefined),
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
};

const constants = {
  data,
  requestHandler,
  confirmed,
};

export default {
  methods,
  constants,
  spies,
  mocks,
};
