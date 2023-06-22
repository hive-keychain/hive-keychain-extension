import { anonymousRequests } from '@background/requests/logic';
import { RequestsHandler } from '@background/requests/request-handler';
import { Rpc } from '@interfaces/rpc.interface';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('anonymousRequests.logic tests:\n', () => {
  // const { constants, spies, callback, methods } = anonymousRequestsLogic;
  // methods.afterEach;
  const account_candidates = {
    empty: [],
    two: ['one', 'two'],
  };
  const current_rpc = {} as Rpc;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('If empty account must call sendErrors', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    anonymousRequests(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      'domain',
      account_candidates.empty,
      current_rpc,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'bgd_auth_no_active',
    );
  });

  it('Must call createPopup with sendMessage callback', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const requestHandler = new RequestsHandler();
    anonymousRequests(
      requestHandler,
      0,
      keychainRequest.noValues.decode,
      'domain',
      accounts.twoAccounts,
      current_rpc,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'chrome.runtime.sendMessage',
    );
  });
});
