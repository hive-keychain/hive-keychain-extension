import { anonymousRequests } from '@background/requests/logic';
import anonymousRequestsLogic from 'src/__tests__/background/requests/logic/mocks/anonymousRequests.logic';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
describe('anonymousRequests.logic tests:\n', () => {
  const { constants, spies, callback, methods } = anonymousRequestsLogic;
  methods.afterEach;
  it('If empty account must call sendErrors', () => {
    anonymousRequests(
      constants.requestHandler,
      constants.tab,
      constants.request,
      constants.domain,
      constants.account_candidates.empty,
      constants.current_rpc,
    );
    expect(
      methods.clean(spies.createPopup.mock.calls[0][0].toString()),
    ).toEqual(methods.clean(callback.sendErrors.toString()));
  });
  it('Must call createPopup with sendMessage callback', () => {
    anonymousRequests(
      constants.requestHandler,
      constants.tab,
      constants.request,
      constants.domain,
      accounts.twoAccounts,
      constants.current_rpc,
    );
    expect(
      methods.clean(spies.createPopup.mock.calls[0][0].toString()),
    ).toEqual(methods.clean(callback.sendMessage.toString()));
  });
});
