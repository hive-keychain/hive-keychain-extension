import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';

const request = keychainRequest.noValues.transfer;
const username = mk.user.one;
const domain = 'domain';
const tab = 0;
const account = accounts.local.one;
const current_rpc = DefaultRpcs[0];
const requestHandler = new RequestsHandler();

const encode = true;
const enforce = true;
const active_accounts = accounts.twoAccounts;

const spies = {
  createPopup: jest.spyOn(dialogLifeCycle, 'createPopup'),
};

const callback = {
  sendMessage: () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      accounts: encode || enforce ? undefined : active_accounts,
      tab,
      rpc: current_rpc,
    });
  },
  sendErrors: {
    noActive: async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_active', [username]),
        request as KeychainRequest,
      );
    },
    noMemo: async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_memo', [username!]),
        request as KeychainRequest,
      );
    },
    noActiveAccounts: async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('bgd_auth_transfer_no_active', [
          username!,
        ]),
        request as KeychainRequest,
      );
    },
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  clean: (str: string) => manipulateStrings.removeTabs(str),
};

const constants = {
  request,
  domain,
  tab,
  account,
  requestHandler,
  current_rpc,
};

export default {
  methods,
  constants,
  spies,
  callback,
};
