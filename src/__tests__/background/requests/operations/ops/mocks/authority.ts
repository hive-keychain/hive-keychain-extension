import { RequestsHandler } from '@background/requests';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import {
  RequestAddAccountAuthority,
  RequestId,
  RequestRemoveAccountAuthority,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import AccountUtils from 'src/utils/account.utils';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();
const data = {
  addAccountAuthority: {
    ...keychainRequest.wValues.addAccountAuthority,
    request_id: 1,
  } as RequestAddAccountAuthority & RequestId,
  removeAccountAuthority: {
    ...keychainRequest.wValues.removeAccountAuthority,
    request_id: 1,
  } as RequestRemoveAccountAuthority & RequestId,
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
  client: {
    database: {
      getAccounts: (result: ExtendedAccount[]) =>
        (requestHandler.getHiveClient().database.getAccounts = jest
          .fn()
          .mockResolvedValue(result)),
    },
    broadcast: {
      updateAccount: (result: TransactionConfirmation) =>
        (requestHandler.getHiveClient().broadcast.updateAccount = jest
          .fn()
          .mockResolvedValue(result)),
    },
  },
  //   getMk: (mk: string | null) =>
  //     (MkModule.getMk = jest.fn().mockResolvedValue(mk)),
  //   getAccountsFromLocalStorage: () =>
  //     (AccountUtils.getAccountsFromLocalStorage = jest
  //       .fn()
  //       .mockResolvedValue(accounts.twoAccounts)),
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

const returned = async (
  success: boolean,
  error: any,
  result: any,
  message: string,
  request_id: string,
  datas: any,
) => {
  return {
    command: DialogCommand.ANSWER_REQUEST,
    msg: {
      success,
      error,
      result,
      datas,
      message,
      request_id,
      publicKey: undefined,
    },
  };
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
  returned,
};
