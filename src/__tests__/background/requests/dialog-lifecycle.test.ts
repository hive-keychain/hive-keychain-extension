import { createPopup } from '@background/requests/dialog-lifecycle';
import { RequestsHandler } from '@background/requests/request-handler';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('dialog-lifecycle tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('createPopup cases:\n', () => {
    it('Must createPopup', () => {
      jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockReturnValue(undefined);
      const requestHandler = new RequestsHandler();
      const sSetConfirmed = jest.spyOn(requestHandler, 'setConfirmed');
      const sGetCurrent = jest.spyOn(chrome.windows, 'getCurrent');
      createPopup(() => {}, requestHandler);
      expect(sSetConfirmed).toHaveBeenCalledWith(false);
      expect(sGetCurrent).toHaveBeenCalledTimes(1);
    });

    it('Must createPopup with windowId as undefined', () => {
      jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockReturnValue(undefined);
      const requestHandler = new RequestsHandler();
      requestHandler.data.windowId = 1;
      const sSetConfirmed = jest.spyOn(requestHandler, 'setConfirmed');
      const sGetCurrent = jest.spyOn(chrome.windows, 'getCurrent');
      const sRemoveWindow = jest.spyOn(DialogLifeCycle, 'removeWindow');
      const sSetWindowId = jest.spyOn(requestHandler, 'setWindowId');
      createPopup(async () => {}, requestHandler);
      expect(sSetConfirmed).toHaveBeenCalledWith(false);
      expect(sRemoveWindow).toHaveBeenCalledWith(1);
      expect(sSetWindowId).toHaveBeenCalledWith(undefined);
      expect(sGetCurrent).toHaveBeenCalledTimes(1);
    });
  });
});
