import { missingKey } from '@background/requests/logic';
import { RequestsHandler } from '@background/requests/request-handler';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('missingKey.logic tests:\n', () => {
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
    missingKey(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      mk.user.one,
      'type_wif',
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'bgd_auth_no_key',
    );
  });
});
