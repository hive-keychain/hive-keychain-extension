import { addAccountToEmptyWallet } from '@background/requests/logic/addAccountToEmptyWallet.logic';
import { RequestsHandler } from '@background/requests/request-handler';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('addAccountToEmptyWallet.logic tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must call sendMessage', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    addAccountToEmptyWallet(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      'domain',
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'popup_html_register',
    );
  });
});
