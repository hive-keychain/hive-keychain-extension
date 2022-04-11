const sendResponse = (message: any, sendResp: (response?: any) => void) => {
  if (!!process.env.IS_FIREFOX) {
    return Promise.resolve(message);
  } else {
    sendResp(message);
  }
};

const BrowserUtils = { sendResponse };

export default BrowserUtils;
