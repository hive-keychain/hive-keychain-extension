import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { ExtendedAccount } from '@hiveio/dhive';
import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();
const dataNoId = keychainRequest.wValues.addAccount;
const data = {
  ...dataNoId,
  request_id: 1,
} as RequestAddAccount & RequestId;

const spies = {
  createPopup: jest.spyOn(dialogLifeCycle, 'createPopup'),
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
};

const callback = {
  sendMessage: () => {},
  sendErrors: () => {},
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const constants = {
  dataNoId,
  data,
  requestHandler,
};

export default {
  methods,
  constants,
  spies,
  callback,
  mocks,
};
