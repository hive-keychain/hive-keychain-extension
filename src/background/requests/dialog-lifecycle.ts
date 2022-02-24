import { RequestsHandler } from '@background/requests';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const createPopup = (
  callback: () => void,
  requestHandler: RequestsHandler,
  popupHtml = 'dialog.html',
) => {
  let width = 350;
  requestHandler.setConfirmed(false);
  //Ensuring only one window is opened by the extension at a time.
  if (requestHandler.data.windowId) {
    removeWindow(requestHandler.data.windowId!);
    requestHandler.setWindowId(undefined);
  }
  //Create new window on the top right of the screen
  chrome.windows.getCurrent((w) => {
    chrome.windows.create(
      {
        url: chrome.runtime.getURL(popupHtml),
        type: 'popup',
        height: 566,
        width: width,
        left: w.width! - width + w.left!,
        top: w.top,
        focused: true,
      },
      (win) => {
        if (!win) return;
        requestHandler.setWindowId(win.id);
        requestHandler.saveInLocalStorage();
        waitUntilDialogIsReady(100, callback);
      },
    );
  });
};

chrome.windows.onRemoved.addListener(async (id: number) => {
  const requestHandler = await RequestsHandler.getFromLocalStorage();
  const { windowId, request, request_id, tab, confirmed } = requestHandler.data;

  if (id == windowId && !confirmed) {
    chrome.tabs.sendMessage(tab!, {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: 'user_cancel',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('bgd_lifecycle_request_canceled'),
        request_id,
      },
    });

    requestHandler.reset(true);
  }
});

const waitUntilDialogIsReady = async (
  ms: number,
  callback: () => void,
  nb = 0,
) => {
  nb++;
  if (await askIfReady(ms)) {
    callback();
  } else {
    waitUntilDialogIsReady(ms, callback, nb);
  }
};

const askIfReady = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, ms);
    chrome.runtime.sendMessage(
      {
        command: DialogCommand.READY,
      },
      (resp) => {
        if (resp) resolve(resp);
      },
    );
  });
};

// check if win exists before removing it
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
