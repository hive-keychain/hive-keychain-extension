// Send errors back to the content_script, it will forward it to website
const sendErrors = (tab, error, message, display_msg, request) => {
  clearInterval(interval);
  interval = setInterval(() => {
    chrome.runtime.sendMessage({
      command: "sendDialogError",
      msg: {
        success: false,
        error: error,
        result: null,
        data: request,
        message: message,
        display_msg: display_msg,
        request_id: request_id
      },
      tab: tab
    });
  }, 200);
  setTimeout(() => {
    clearInterval(interval);
  }, 2000);
  key = null;
  accounts = new AccountsList();
};
