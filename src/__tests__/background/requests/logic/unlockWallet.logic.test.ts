import { unlockWallet } from '@background/requests/logic';
import unlockWalletLogic from 'src/__tests__/background/requests/logic/mocks/unlockWallet.logic';
describe('unlockWallet.logic tests:\n', () => {
  const { constants, methods, spies, callback } = unlockWalletLogic;
  const { requestHandler, tab, request, domain } = constants;
  methods.afterEach;
  it('Must call createPopup with sendMessage callback', () => {
    unlockWallet(requestHandler, tab, request, domain);
    expect(spies.createPopup.mock.calls[0][0].toString()).toEqual(
      callback.sendMessage.toString(),
    );
  });
});
