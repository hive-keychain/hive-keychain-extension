import { initializeWallet } from '@background/requests/logic';
import { RequestsHandler } from '@background/requests/request-handler';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('initializeWallet.logic tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must call createPopup with sendErrors callback', async () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    initializeWallet(requestHandler, 0, keychainRequest.noValues.decode);
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'bgd_init_no_wallet',
    );
  });
});
