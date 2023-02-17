import { createPopup } from '@background/requests/dialog-lifecycle';
import dialogLifecycleMocks from 'src/__tests__/background/requests/mocks/dialog-lifecycle-mocks';

describe('dialog-lifecycle tests:\n', () => {
  const { methods, constants, spies } = dialogLifecycleMocks;
  const { requestHandler } = constants;
  methods.afterAll;
  methods.afterEach;
  methods.beforeEach;
  describe('createPopup cases:\n', () => {
    it('Must createPopup', () => {
      spies.requestHandler.saveInLocalStorage;
      createPopup(async () => {}, requestHandler);
      expect(spies.requestHandler.setConfirmed).toBeCalledWith(false);
      expect(spies.chrome.windows.getCurrent).toBeCalledTimes(1);
    });
    it('Must createPopup with windowId as undefined', () => {
      spies.requestHandler.saveInLocalStorage;
      requestHandler.data.windowId = 1;
      createPopup(async () => {}, requestHandler);
      expect(spies.requestHandler.setConfirmed).toBeCalledWith(false);
      expect(spies.removeWindow).toBeCalledWith(1);
      expect(spies.requestHandler.setWindowId).toBeCalledWith(undefined);
      expect(spies.chrome.windows.getCurrent).toBeCalledTimes(1);
    });
  });
});
