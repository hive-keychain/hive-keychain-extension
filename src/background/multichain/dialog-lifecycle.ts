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

export const createPopup = async (
  callback: () => void,
  requestHandler: HiveRequestsHandler | EvmRequestHandler,
  popupHtml = 'dialog.html',
  height = 600,
) => {
  let width = 435;
  //Ensuring only one window is opened by the extension at a time.
  if (requestHandler.windowId) {
    chrome.windows.update(requestHandler.windowId, {
      focused: true,
    } as chrome.windows.UpdateInfo);
    callback();
  }
  //Create new window on the top right of the screen
  /* istanbul ignore next */
  else {
    chrome.windows.getCurrent((w) => {
      chrome.windows.create(
        {
          url: chrome.runtime.getURL(popupHtml),
          type: 'popup',
          height: height,
          width: width,
          left: w.width! - width + w.left!,
          top: w.top,
          focused: false,
        },
        (win) => {
          if (!win) return;
          chrome.windows.update(
            win.id!,
            {
              height: height,
              width: width,
              top: w.top,
              left: w.width! - width + w.left!,
            },
            () => {
              requestHandler.setWindowId(win.id);
              requestHandler.saveInLocalStorage();
              waitUntilDialogIsReady(100, DialogCommand.READY, callback);
            },
          );
        },
      );
    });
  }
};

// check if win exists before removing it
/* istanbul ignore next */
export const removeWindow = (windowId: number) => {
  chrome.windows.getAll((windows) => {
    const hasWin = windows.filter((win) => {
      return win.id == windowId;
    }).length;
    if (hasWin) {
      chrome.windows.remove(windowId);
      removeData();
    }
  });
};

// When a chrome window is removed, check if there are no window left open
chrome.windows.onRemoved.addListener(async (id: number) => {
  await onRemoveEvm(id);
  await onRemoveHive(id);
  removeData();
  chrome.windows.getAll((windows) => {
    if (windows.length === 0) {
      VaultUtils.removeFromVault(VaultKey.__MK);
    }
  });
});

const removeData = () => {
  LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.DIALOG_WINDOW_ID,
  );
  LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
  );
  LocalStorageUtils.removeFromLocalStorage(
    LocalStorageKeyEnum.__REQUEST_HANDLER,
  );
};
