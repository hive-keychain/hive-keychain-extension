import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { addAccount } from '@background/requests/operations/ops/add-account';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountKeys,
  RequestId,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/utils/account.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();
const data = {
  domain: 'domain',
  username: mk.user.one,
  type: KeychainRequestTypes.addAccount,
  keys: userData.one.nonEncryptKeys as RequestAddAccountKeys,
  request_id: 1,
} as RequestAddAccount & RequestId;

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
  client: {
    database: {
      getAccounts: (result: ExtendedAccount[]) =>
        (requestHandler.getHiveClient().database.getAccounts = jest
          .fn()
          .mockResolvedValue(result)),
    },
  },
  getMk: (mk: string | null) =>
    (MkModule.getMk = jest.fn().mockResolvedValue(mk)),
  getAccountsFromLocalStorage: () =>
    (AccountUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(accounts.twoAccounts)),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
  }),
  tryBlock: async (
    errorDesc: string,
    cloneData: RequestAddAccount & RequestId,
  ) => {
    try {
      mocks.client.database.getAccounts([accounts.extended]);
      mocks.getMk(null);
      await addAccount(requestHandler, cloneData);
    } catch (error) {
      expect(error).toEqual(new Error(errorDesc));
    }
  },
};

const constants = {
  data,
  requestHandler,
};

export default {
  methods,
  constants,
  spies,
  mocks,
};
