import { requestWithConfirmation } from '@background/requests/logic';
import { RequestsHandler } from '@background/requests/request-handler';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('requestWithConfirmation.logic tests:\n', () => {
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
    requestWithConfirmation(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      'domain',
      DefaultRpcs[0],
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'chrome.runtime.sendMessage',
    );
  });
});
