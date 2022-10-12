import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';

const request = keychainRequest.noValues.decode;
const domain = '';
const tab = 0;
const account = accounts.local.one;
const requestHandler = new RequestsHandler();

const spies = {
  createPopup: jest.spyOn(dialogLifeCycle, 'createPopup'),
};

const callback = {
  sendMessage: () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      tab,
    });
  },
  sendErrors: async () => {
    sendErrors(
      requestHandler,
      tab!,
      'user_cancel',
      await chrome.i18n.getMessage('bgd_auth_canceled'),
      await chrome.i18n.getMessage('popup_accounts_already_registered', [
        account.name,
      ]),
      request,
    );
  },
};

const methods = {
  afterEach: afterEach(() => {
    spies.createPopup.mockClear();
    spies.createPopup.mockReset();
  }),
};

const constants = {
  request,
  domain,
  tab,
  account,
  requestHandler,
};

export default {
  methods,
  constants,
  spies,
  callback,
};
