import { addAccountRequest } from '@background/requests/logic/addAccountRequest.logic';
import { RequestsHandler } from '@background/requests/request-handler';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('addAccountRequest.logic tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must call createPopup with sendErrors callback', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    addAccountRequest(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      'domain',
      accounts.local.one,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      "chrome.i18n.getMessage('popup_accounts_already_registered",
    );
  });

  it('Must call createPopup with sendMessage callback', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    addAccountRequest(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      'domain',
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'chrome.runtime.sendMessage',
    );
  });
});
