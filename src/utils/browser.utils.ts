const sendResponse = async (
  message: any,
  sendResp: (response?: any) => void,
) => {
  if (!!process.env.IS_FIREFOX) {
    return Promise.resolve(message);
  } else {
    sendResp(message);
    chrome.windows.update((await chrome.windows.getCurrent()).id!, {
      focused: true,
    });
  }
};

const BrowserUtils = { sendResponse };

export default BrowserUtils;
