import { RequestsHandler } from '@background/requests/request-handler';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';

const request = keychainRequest.noValues.decode;
const domain = 'domain';
const tab = 0;
const requestHandler = new RequestsHandler();

const spies = {
  createPopup: jest.spyOn(dialogLifeCycle, 'createPopup'),
};

const callback = {
  sendMessage: async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.UNLOCK,
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: await chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab,
      domain,
    });
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
  requestHandler,
};

export default {
  methods,
  constants,
  spies,
  callback,
};
