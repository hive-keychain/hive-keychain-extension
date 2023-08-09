import { transferRequest } from '@background/requests/logic';
import { RequestsHandler } from '@background/requests/request-handler';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';

describe('transferRequest.logic tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must call createPopup with sendErrors if no active key', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const accountNoActive = objects.clone(accounts.local.one) as LocalAccount;
    delete accountNoActive.keys.active;
    const request = keychainRequest.noValues.transfer;
    request.username = mk.user.one;
    request.enforce = true;
    request.memo = '#';
    const requestHandler = new RequestsHandler();
    transferRequest(
      requestHandler,
      0,
      request,
      'domain',
      accounts.twoAccounts,
      DefaultRpcs[0],
      accountNoActive,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'bgd_auth_transfer_no_active',
    );
  });

  it('Must call createPopup with sendErrors if no memo key', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const accountNoMemo = objects.clone(accounts.local.one) as LocalAccount;
    delete accountNoMemo.keys.memo;
    const request = keychainRequest.noValues.transfer;
    request.username = mk.user.one;
    request.enforce = false;
    request.memo = '#';
    const requestHandler = new RequestsHandler();
    transferRequest(
      requestHandler,
      0,
      request,
      'domain',
      accounts.twoAccounts,
      DefaultRpcs[0],
      accountNoMemo,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'bgd_auth_transfer_no_memo',
    );
  });

  it('Must call createPopup with sendErrors if no acccounts', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const account = objects.clone(accounts.local.one) as LocalAccount;
    const request = keychainRequest.noValues.transfer;
    request.username = mk.user.one;
    const requestHandler = new RequestsHandler();
    transferRequest(
      requestHandler,
      0,
      request,
      'domain',
      [],
      DefaultRpcs[0],
      account,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'bgd_auth_transfer_no_active',
    );
  });

  it('Must call createPopup with sendMessage callback', () => {
    const sCreatePopup = jest
      .spyOn(DialogLifeCycle, 'createPopup')
      .mockImplementation(() => undefined);
    const account = objects.clone(accounts.local.one) as LocalAccount;
    const request = keychainRequest.noValues.transfer;
    request.username = mk.user.one;
    const requestHandler = new RequestsHandler();
    transferRequest(
      requestHandler,
      0,
      request,
      'domain',
      accounts.twoAccounts,
      DefaultRpcs[0],
      account,
    );
    expect(sCreatePopup.mock.calls[0][0].toString()).toContain(
      'chrome.runtime.sendMessage',
    );
  });
});
