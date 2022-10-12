import { addAccountToEmptyWallet } from '@background/requests/logic/addAccountToEmptyWallet.logic';
import addAccountToEmptyWalletLogic from 'src/__tests__/background/requests/logic/mocks/addAccountToEmptyWallet.logic';
describe('addAccountToEmptyWallet.logic tests:\n', () => {
  const { constants, spies, callback, methods } = addAccountToEmptyWalletLogic;
  const { request, requestHandler, tab, domain } = constants;
  methods.afterEach;
  it('Must call sendMessage', () => {
    addAccountToEmptyWallet(requestHandler, tab, request, domain);
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendMessage.toString(),
    );
  });
});
