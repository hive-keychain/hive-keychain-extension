import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import * as SendErrorsModule from 'src/background/requests/errors';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const request = keychainRequest.noValues.decode;
const tab = 0;
const requestHandler = new RequestsHandler();
const username = mk.user.one;
const typeWif = 'type_wif';

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
      tab,
      'user_cancel',
      await chrome.i18n.getMessage('bgd_auth_canceled'),
      await chrome.i18n.getMessage('bgd_auth_no_key', [username, typeWif]),
      request,
    );
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
  tab,
  requestHandler,
  username,
  typeWif,
};

export default {
  methods,
  constants,
  spies,
  callback,
};
