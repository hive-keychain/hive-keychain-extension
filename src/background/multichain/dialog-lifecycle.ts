import { onRemoveEvm } from '@background/evm/evm-dialog-lifecycle';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { onRemoveHive } from '@background/hive/hive-dialog-lifecycle';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { waitUntilDialogIsReady } from '@background/utils/window.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

const DIALOG_WIDTH = 435;

const getCurrentWindow = () =>
  new Promise<chrome.windows.Window>((resolve) => {
    chrome.windows.getCurrent((window) => resolve(window));
  });

const waitForDialogReady = (callback: () => void) => {
  waitUntilDialogIsReady(100, DialogCommand.READY, callback);
};

const saveDialogWindowId = async (windowId?: number) => {
  if (windowId === undefined) {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
    );
    return;
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
    windowId,
  );
};

export const clearDialogWindowId = async () => {
  await LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
};

export const getDialogWindowId = async () => {
  return LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
};

const updateExistingDialog = async (windowId: number, height: number) => {
  const currentWindow = await getCurrentWindow();

  return new Promise<void>((resolve, reject) => {
    chrome.windows.update(
      windowId,
      {
        focused: true,
        height,
        width: DIALOG_WIDTH,
        left: currentWindow.width! - DIALOG_WIDTH + currentWindow.left!,
        top: currentWindow.top,
      } as chrome.windows.UpdateInfo,
      (window) => {
        if (chrome.runtime.lastError || !window) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      },
    );
  });
};

export const createOrUpdateDialog = async (
  callback: () => void,
  requestHandler?: HiveRequestsHandler | EvmRequestHandler,
  popupHtml = 'dialog.html',
  height = 600,
) => {
  const windowId = (await getDialogWindowId()) ?? requestHandler?.windowId;

  if (windowId) {
    try {
      await updateExistingDialog(windowId, height);
      requestHandler?.setWindowId(windowId);
      await saveDialogWindowId(windowId);
      waitForDialogReady(callback);
      return;
    } catch (error) {
      console.log('error in update window', error);
    }
  }

  await createDialog(callback, requestHandler, popupHtml, height);
};

export const createDialog = async (
  callback: () => void,
  requestHandler?: HiveRequestsHandler | EvmRequestHandler,
  popupHtml = 'dialog.html',
  height = 600,
) => {
  const currentWindow = await getCurrentWindow();

  chrome.windows.create(
    {
      url: chrome.runtime.getURL(popupHtml),
      type: 'popup',
      height,
      width: DIALOG_WIDTH,
      left: currentWindow.width! - DIALOG_WIDTH + currentWindow.left!,
      top: currentWindow.top,
      focused: false,
    },
    async (window) => {
      if (!window?.id) return;

      chrome.windows.update(
        window.id,
        {
          height,
          width: DIALOG_WIDTH,
          top: currentWindow.top,
          left: currentWindow.width! - DIALOG_WIDTH + currentWindow.left!,
        },
        async () => {
          requestHandler?.setWindowId(window.id);
          await saveDialogWindowId(window.id);
          waitForDialogReady(callback);
        },
      );
    },
  );
};

// check if win exists before removing it
/* istanbul ignore next */
export const removeWindow = (windowId: number) => {
  clearDialogWindowId();
  chrome.windows.getAll((windows) => {
    const hasWindow = windows.some((window) => window.id === windowId);
    if (hasWindow) {
      chrome.windows.remove(windowId);
    }
  });
};

chrome.windows.onRemoved.addListener(async (id: number) => {
  const dialogWindowId = await getDialogWindowId();
  if (dialogWindowId && id === dialogWindowId) {
    await Promise.all([onRemoveEvm(id), onRemoveHive(id)]);
    await clearDialogWindowId();
  }

  chrome.windows.getAll((windows) => {
    if (windows.length === 0) {
      VaultUtils.removeFromVault(VaultKey.__MK);
    }
  });
});
