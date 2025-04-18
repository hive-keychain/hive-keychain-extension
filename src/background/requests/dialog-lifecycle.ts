import { RequestsHandler } from '@background/requests/request-handler';
import { waitUntilDialogIsReady } from '@background/utils/window.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const createPopup = (
  callback: () => void,
  requestHandler: RequestsHandler,
  popupHtml = 'dialog.html',
) => {
  let width = 435;
  let height = 600;
  requestHandler.setConfirmed(false);
  //Ensuring only one window is opened by the extension at a time.
  if (requestHandler.data.windowId) {
    removeWindow(requestHandler.data.windowId!);
    requestHandler.setWindowId(undefined);
  }
  //Create new window on the top right of the screen
  /* istanbul ignore next */
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
};
/* istanbul ignore next */
chrome.windows.onRemoved.addListener(async (id: number) => {
  const requestHandler = await RequestsHandler.getFromLocalStorage();
  const { windowId, request, request_id, tab, confirmed, isMultisig } =
    requestHandler.data;
  if (id == windowId && !confirmed && tab) {
    if (request?.type?.includes('vsc')) {
      return;
    }
    chrome.tabs.sendMessage(tab!, {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: isMultisig ? 'pending_multisig' : 'user_cancel',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage(
          `bgd_lifecycle_request_${
            isMultisig ? 'pending_multisig' : 'canceled'
          }`,
        ),
        request_id,
      },
    });

    requestHandler.reset(true);
  }
});

// check if win exists before removing it
/* istanbul ignore next */
export const removeWindow = (windowId: number) => {
  chrome.windows.getAll((windows) => {
    const hasWin = windows.filter((win) => {
      return win.id == windowId;
    }).length;
    if (hasWin) {
      chrome.windows.remove(windowId);
    }
  });
};
