import { unlockWallet } from '@background/requests/logic';
import { RequestsHandler } from '@background/requests/request-handler';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('unlockWallet.logic tests:\n', () => {
  const callback = {
    sendMessage: async () => {
      chrome.runtime.sendMessage({
        command: DialogCommand.UNLOCK,
        msg: {
          success: false,
          error: 'locked',
          result: null,
          data: keychainRequest.noValues.decode,
          message: await chrome.i18n.getMessage('bgd_auth_locked'),
          display_msg: await chrome.i18n.getMessage('bgd_auth_locked_desc'),
        },
        tab: 0,
        domain: 'domain',
      });
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must call createPopup with sendMessage callback', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    unlockWallet(requestHandler, 0, keychainRequest.noValues.decode, 'domain');
    expect(JSON.stringify(sCreatePopup.mock.calls[0][0])).toEqual(
      JSON.stringify(callback.sendMessage),
    );
  });
});
