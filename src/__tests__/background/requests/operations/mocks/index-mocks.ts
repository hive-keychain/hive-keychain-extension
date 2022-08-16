import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { ExtendedAccount, TransactionConfirmation } from '@hiveio/dhive';
import { KeychainRequest } from '@interfaces/keychain.interface';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import AccountUtils from 'src/utils/account.utils';
import Logger from 'src/utils/logger.utils';
import * as PreferencesUtils from 'src/utils/preferences.utils';
import addAccountMocks from 'src/__tests__/background/requests/operations/ops/mocks/add-account-mocks';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import broadcast from 'src/__tests__/background/requests/operations/ops/mocks/broadcast';
import convertMocks from 'src/__tests__/background/requests/operations/ops/mocks/convert-mocks';
import createClaimedAccount from 'src/__tests__/background/requests/operations/ops/mocks/create-claimed-account';
import customJsonMocks from 'src/__tests__/background/requests/operations/ops/mocks/custom-json-mocks';
import decodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/decode-memo';
import delegationMocks from 'src/__tests__/background/requests/operations/ops/mocks/delegation-mocks';
import encodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/encode-memo';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import powerMocks from 'src/__tests__/background/requests/operations/ops/mocks/power-mocks';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import proxyMocks from 'src/__tests__/background/requests/operations/ops/mocks/proxy-mocks';
import recurrentTransferMocks from 'src/__tests__/background/requests/operations/ops/mocks/recurrent-transfer-mocks';
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
import signMessageMocks from 'src/__tests__/background/requests/operations/ops/mocks/signMessage-mocks';
import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
import witnessVoteMocks from 'src/__tests__/background/requests/operations/ops/mocks/witness-vote-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

//TODO change the array, it needs objects with function: 'addAccount'
const _data = [
  addAccountMocks.constants.data,
  customJsonMocks.constants.data,
  voteMocks.constants.data,
  transferMocks.constants.data,
  postMocks.constants.data,
  authority.constants.data.addAccountAuthority,
  authority.constants.data.removeAccountAuthority,
  authority.constants.data.addKeyAuthority,
  authority.constants.data.removeKeyAuthority,
  broadcast.constants.data,
  createClaimedAccount.constants.data,
  delegationMocks.constants.data,
  witnessVoteMocks.constants.data,
  proxyMocks.constants.data,
  powerMocks.constants.data.powerUp,
  powerMocks.constants.data.powerDown,
  sendTokenMocks.constants.data,
  proposalsMocks.constants.data.create,
  proposalsMocks.constants.data.update,
  proposalsMocks.constants.data.remove,
  decodeMemo.constants.data,
  encodeMemo.constants.data,
  signMessageMocks.constants.data,
  signTxMocks.constants.data,
  convertMocks.constants.data,
  recurrentTransferMocks.constants.data,
] as KeychainRequest[];

// const data = {
//   domain: 'domain',
//   type: KeychainRequestTypes.transfer,
//   username: mk.user.one,
//   to: 'theghost1980',
//   amount: '1000',
//   memo: 'The Quan',
//   currency: 'LEO',
// } as RequestTransfer & RequestId;

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
  // assert: {
  //   error: (
  //     result: any,
  //     error: TypeError | SyntaxError,
  //     data: KeychainRequestData & RequestId,
  //     errorMessage: string,
  //   ) => {
  //     const { request_id, ...datas } = data;
  //     expect(result).toEqual(
  //       messages.error.answerError(
  //         error,
  //         datas,
  //         request_id,
  //         `${chrome.i18n.getMessage('bgd_ops_error')} : ${errorMessage}`,
  //         undefined,
  //       ),
  //     );
  //   },
  //   success: (result: any, message: string) => {
  //     const { request_id, ...datas } = data;
  //     expect(result).toEqual(
  //       messages.success.answerSucess(
  //         confirmed,
  //         datas,
  //         request_id,
  //         message,
  //         undefined,
  //       ),
  //     );
  //   },
  // },
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
