import { RequestsHandler } from '@background/requests';
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
  sendMessage: async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.REGISTER,
      msg: {
        success: false,
        error: 'register',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('popup_html_register'),
        display_msg: await chrome.i18n.getMessage('popup_html_register'),
      },
      tab,
      domain,
    });
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
