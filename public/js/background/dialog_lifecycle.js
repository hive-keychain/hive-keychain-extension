const createPopup = (callback, popupHtml = "public/dialog.html") => {
  let width = 350;
  confirmed = false;
  //Ensuring only one window is opened by the extension at a time.
  if (id_win != null) {
    removeWindow(id_win);
    id_win = null;
  }
  //Create new window on the top right of the screen
  chrome.windows.getCurrent((w) => {
    console.log(popupHtml);
    chrome.windows.create(
      {
        url: chrome.runtime.getURL(popupHtml),
        type: "popup",
        height: 566,
        width: width,
        left: w.width - width + w.left,
        top: w.top,
      },
      (win) => {
        id_win = win.id;
        // Window create fails to take into account window size so it s updated afterwhile.
        chrome.windows.update(win.id, {
          height: 566,
          width: width,
          top: w.top,
          left: w.width - width + w.left,
        });

        if (typeof callback === "function") {
          clearInterval(interval);
          interval = setInterval(callback, 200);
          setTimeout(() => {
            clearInterval(interval);
          }, 2000);
        }
      }
    );
  });
};

chrome.windows.onRemoved.addListener((id) => {
  if (id == id_win && !confirmed) {
    console.log("error6");
    chrome.tabs.sendMessage(tab, {
      command: "answerRequest",
      msg: {
        success: false,
        error: "user_cancel",
        result: null,
        data: request,
        message: chrome.i18n.getMessage("bgd_lifecycle_request_canceled"),
        request_id: request_id,
      },
    });
  }
});

// check if win exists before removing it
const removeWindow = (id_win) => {
  console.log(id_win);
  chrome.windows.getAll((windows) => {
    const hasWin = windows.filter((win) => {
      return win.id == id_win;
    }).length;
    if (hasWin) {
      chrome.windows.remove(id_win);
    }
  });
};
