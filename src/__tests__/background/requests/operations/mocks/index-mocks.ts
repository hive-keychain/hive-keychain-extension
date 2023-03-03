import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import AccountUtils from 'src/utils/account.utils';
import Logger from 'src/utils/logger.utils';
import * as PreferencesUtils from 'src/utils/preferences.utils';
import indexReferenceData from 'src/__tests__/background/requests/operations/mocks/index-reference-data';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const _data = indexReferenceData.indexData;

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
  getMk: (mk: string | null) =>
    (MkModule.getMk = jest.fn().mockResolvedValue(mk)),
  getAccountsFromLocalStorage: () =>
    (AccountUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(accounts.twoAccounts)),
  getExtendedAccount: (account: ExtendedAccount) =>
    (AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(account)),
};

const spies = {
  logger: {
    info: jest.spyOn(Logger, 'info'),
    log: jest.spyOn(Logger, 'log'),
    error: jest.spyOn(Logger, 'error'),
  },
  sendMessage: jest.spyOn(chrome.runtime, 'sendMessage'),
  addToWhitelist: jest.spyOn(PreferencesUtils, 'addToWhitelist'),
  reset: jest.spyOn(requestHandler, 'reset'),
  removeWindow: jest.spyOn(DialogLifeCycle, 'removeWindow'),
  tabsSendMessage: jest.spyOn(chrome.tabs, 'sendMessage'),
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
    mocks.getAccountsFromLocalStorage();
    mocks.getMk(mk.user.one);
  }),
};

const constants = {
  requestHandler,
  confirmed,
  _data,
};

export default {
  methods,
  constants,
  mocks,
  spies,
};
