import { RequestsHandler } from '@background/requests/request-handler';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import * as dialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';

const request = keychainRequest.noValues.decode;
const domain = 'domain';
const current_rpc = DefaultRpcs[0];
const tab = 0;
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
      rpc: current_rpc,
      hiveEngineConfig: requestHandler.hiveEngineConfig,
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
  tab,
  requestHandler,
  domain,
  current_rpc,
};

export default {
  methods,
  constants,
  spies,
  callback,
};
