import { getRequestModule } from '@background/requests';

export const createPopup = (
  callback: () => void,
  popupHtml = 'dialog.html',
) => {
  let width = 350;
  getRequestModule().setConfirmed(false);
  //Ensuring only one window is opened by the extension at a time.
  if (getRequestModule().windowId) {
    removeWindow(getRequestModule().windowId!);
    getRequestModule().setWindowId(undefined);
  }
  //Create new window on the top right of the screen
  chrome.windows.getCurrent((w) => {
    console.log(popupHtml);
    chrome.windows.create(
      {
        url: chrome.runtime.getURL(popupHtml),
        type: 'popup',
        height: 566,
        width: width,
        left: w.width! - width + w.left!,
        top: w.top,
      },
      (win) => {
        if (!win) return; //TODO: Check if that doesnt cause issue
        getRequestModule().setWindowId(win.id);
        // Window create fails to take into account window size so it s updated afterwhile.
        chrome.windows.update(
          win.id!,
          {
            height: 566,
            width: width,
            top: w.top,
            left: w.width! - width + w.left!,
          },
          () => {
            setTimeout(callback, 200);
          },
        );
        //TODO : Check if the implementation is better
        // if (typeof callback === 'function') {
        //   clearInterval(interval);
        //   interval = setInterval(callback, 200);
        //   setTimeout(() => {
        //     clearInterval(interval);
        //   }, 2000);
        // }
      },
    );
  });
};

chrome.windows.onRemoved.addListener((id: number) => {
  console.log('removing window', getRequestModule());

  const { windowId, request, request_id, tab, confirmed } = getRequestModule();

  if (id == windowId && !confirmed) {
    console.log('removed window');
    console.log(tab!, {
      command: 'answerRequest',
      msg: {
        success: false,
        error: 'user_cancel',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('bgd_lifecycle_request_canceled'),
        request_id: request_id,
      },
    });
    chrome.tabs.sendMessage(tab!, {
      command: 'answerRequest',
      msg: {
        success: false,
        error: 'user_cancel',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('bgd_lifecycle_request_canceled'),
        request_id: request_id,
      },
    });
  }
});

// check if win exists before removing it
const removeWindow = (windowId: number) => {
  chrome.windows.getAll((windows) => {
    const hasWin = windows.filter((win) => {
      return win.id == windowId;
    }).length;
    if (hasWin) {
      chrome.windows.remove(windowId);
    }
  });
};
