import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const removeWindow = (windowId: number) => {
  void LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
  chrome.windows.remove(windowId);
};

export const createPopup = async (
  callback: () => void | Promise<void>,
  requestHandler?: any,
) => {
  requestHandler?.setConfirmed(false);

  if (requestHandler?.data.windowId !== undefined) {
    removeWindow(requestHandler.data.windowId);
    requestHandler.setWindowId(undefined);
  }

  chrome.windows.getCurrent(async () => {
    await callback();
  });
};
