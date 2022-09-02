import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import * as SendErrorsModule from 'src/background/requests/errors';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';

const request = keychainRequest.noValues.decode;
const domain = '';
const tab = 0;
const requestHandler = new RequestsHandler();
const current_rpc = {} as Rpc;
const account_candidates = {
  empty: [],
  two: ['one', 'two'],
};

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
  sendErrors: async () => {
    sendErrors(
      requestHandler,
      tab!,
      'user_cancel',
      await chrome.i18n.getMessage('bgd_auth_canceled'),
      await chrome.i18n.getMessage('bgd_auth_no_active'),
      request,
    );
  },
  sendMessage: () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      accounts: account_candidates,
      tab,
      rpc: current_rpc,
    });
  },
};

const methods = {
  beforeEach: beforeEach(() => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
  }),
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
};

const constants = {
  request,
  domain,
  tab,
  account_candidates,
  requestHandler,
  current_rpc,
};

export default {
  methods,
  constants,
  spies,
  callback,
};
