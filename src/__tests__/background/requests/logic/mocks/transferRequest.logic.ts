import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import { transferRequest } from '@background/requests/logic';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import * as SendErrorsModule from 'src/background/requests/errors';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';

const request = keychainRequest.noValues.transfer;
const username = mk.user.one;
const domain = 'domain';
const tab = 0;
const account = accounts.local.one;
const current_rpc = DefaultRpcs[0];
const requestHandler = new RequestsHandler();

const spies = {
  createPopup: jest
    .spyOn(dialogLifeCycle, 'createPopup')
    .mockImplementation(
      (
        callback: () => void,
        requestHandler: RequestsHandler,
        popupHtml = 'dialog.html',
      ) => {
        jest.spyOn(SendErrorsModule, 'default');
        chrome.runtime.sendMessage = jest.fn();
        callback();
      },
    ),
};

const callback = {
  sendMessage: () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      accounts: null,
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
  beforeEach: beforeEach(() => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
  }),
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  assertSendMessage: (request: any, _accounts: string[] | undefined) => {
    const account = objects.clone(accounts.local.one) as LocalAccount;
    transferRequest(
      requestHandler,
      tab,
      request,
      domain,
      accounts.twoAccounts,
      current_rpc,
      account,
    );
    expect(JSON.stringify(spies.createPopup.mock.calls[0][0])).toEqual(
      JSON.stringify(callback.sendMessage),
    );
    expect(jest.spyOn(chrome.runtime, 'sendMessage')).toBeCalledWith({
      accounts: _accounts,
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      rpc: current_rpc,
      tab,
    });
    expect(spies.createPopup.mock.calls[0][1]).toEqual(requestHandler);
  },
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
