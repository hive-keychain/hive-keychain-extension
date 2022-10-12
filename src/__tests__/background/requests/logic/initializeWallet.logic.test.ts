import { initializeWallet } from '@background/requests/logic';
import initializeWalletLogic from 'src/__tests__/background/requests/logic/mocks/initialize-wallet.logic';
describe('initializeWallet.logic tests:\n', () => {
  const { methods, callback, spies, constants } = initializeWalletLogic;
  const { tab, request, requestHandler } = constants;
  methods.afterEach;
  it('Must call createPopup with sendErrors callback', async () => {
    initializeWallet(requestHandler, tab, request);
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendErrors.toString(),
    );
  });
});
