import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import AccountUtils from 'src/utils/account.utils';
import Logger from 'src/utils/logger.utils';
import * as PreferencesUtils from 'src/utils/preferences.utils';
import indexReferenceData from 'src/__tests__/background/requests/operations/mocks/index-reference-data';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
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
  client: {
    broadcast: {
      sendOperations: (id: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValue(id)),
      json: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.json = jest
          .fn()
          .mockResolvedValue(result)),
      vote: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.vote = jest
          .fn()
          .mockResolvedValue(result)),
      transfer: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.transfer = jest
          .fn()
          .mockResolvedValue(result)),
      comment: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.comment = jest
          .fn()
          .mockResolvedValue(result)),
      updateAccount: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.updateAccount = jest
          .fn()
          .mockResolvedValue(result)),
      delegateVestingShares: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.delegateVestingShares = jest
          .fn()
          .mockResolvedValue(result)),
    },
    database: {
      getAccounts: (receiverAccount: ExtendedAccount[]) =>
        (requestHandler.getHiveClient().database.getAccounts = jest
          .fn()
          .mockResolvedValue(receiverAccount)),
      getDynamicGlobalProperties: () =>
        (requestHandler.getHiveClient().database.getDynamicGlobalProperties =
          jest.fn().mockResolvedValue(dynamic.globalProperties)),
      call: (
        conversions: { requestid: number }[],
        collaterized: { requestid: number }[],
      ) =>
        (requestHandler.getHiveClient().database.call = jest
          .fn()
          .mockResolvedValueOnce(conversions)
          .mockResolvedValueOnce(collaterized)),
    },
  },
  getMk: (mk: string | null) =>
    (MkModule.getMk = jest.fn().mockResolvedValue(mk)),
  getAccountsFromLocalStorage: () =>
    (AccountUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(accounts.twoAccounts)),
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
    mocks.client.database.call([{ requestid: 1 }], [{ requestid: 2 }]);
    mocks.client.broadcast.delegateVestingShares(confirmed);
    mocks.client.broadcast.updateAccount(confirmed);
    mocks.client.broadcast.comment(confirmed);
    mocks.client.broadcast.transfer(confirmed);
    mocks.client.broadcast.vote(confirmed);
    mocks.client.broadcast.json(confirmed);
    mocks.client.broadcast.sendOperations(confirmed);
    mocks.client.database.getAccounts([accounts.extended]);
    mocks.getAccountsFromLocalStorage();
    mocks.getMk(mk.user.one);
    mocks.client.database.getDynamicGlobalProperties();
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
