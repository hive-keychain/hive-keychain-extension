import { transferRequest } from '@background/requests/logic';
import { LocalAccount } from '@interfaces/local-account.interface';
import transferRequestLogic from 'src/__tests__/background/requests/logic/mocks/transferRequest.logic';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('transferRequest.logic tests:\n', () => {
  const { methods, constants, spies, callback } = transferRequestLogic;
  const { requestHandler, request, domain, current_rpc } = constants;
  const { tab } = constants;
  methods.afterEach;
  it('Must call createPopup with sendErrors if no active key', () => {
    const accountNoActive = objects.clone(accounts.local.one) as LocalAccount;
    delete accountNoActive.keys.active;
    request.username = mk.user.one;
    request.enforce = true;
    request.memo = '#';
    transferRequest(
      requestHandler,
      tab,
      request,
      domain,
      accounts.twoAccounts,
      current_rpc,
      accountNoActive,
    );
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendErrors.noActive.toString(),
    );
  });
  it('Must call createPopup with sendErrors if no memo key', () => {
    const accountNoMemo = objects.clone(accounts.local.one) as LocalAccount;
    delete accountNoMemo.keys.memo;
    request.username = mk.user.one;
    request.enforce = false;
    request.memo = '#';
    transferRequest(
      requestHandler,
      tab,
      request,
      domain,
      accounts.twoAccounts,
      current_rpc,
      accountNoMemo,
    );
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendErrors.noMemo.toString(),
    );
  });
  it('Must call createPopup with sendErrors if no acccounts', () => {
    const account = objects.clone(accounts.local.one) as LocalAccount;
    request.username = mk.user.one;
    transferRequest(
      requestHandler,
      tab,
      request,
      domain,
      [],
      current_rpc,
      account,
    );
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendErrors.noActiveAccounts.toString(),
    );
  });
  it('Must call createPopup with sendMessage callback', () => {
    const account = objects.clone(accounts.local.one) as LocalAccount;
    request.username = mk.user.one;
    transferRequest(
      requestHandler,
      tab,
      request,
      domain,
      accounts.twoAccounts,
      current_rpc,
      account,
    );
    expect(
      methods.clean(spies.createPopup.mock.calls[0][0].toString()),
    ).toEqual(methods.clean(callback.sendMessage.toString()));
  });
});
