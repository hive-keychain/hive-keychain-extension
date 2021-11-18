import { getRequestHandler } from '@background/requests';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

// Send errors back to the content_script, it will forward it to website
const sendErrors = (
  tab: number,
  error: string,
  message: string,
  display_msg: string,
  request: KeychainRequest,
) => {
  // TODO: Cleanup if interval is not needed
  // clearInterval(interval);
  // interval = setInterval(() => {
  chrome.runtime.sendMessage({
    command: DialogCommand.SEND_DIALOG_ERROR,
    msg: {
      success: false,
      error: error,
      result: null,
      data: request,
      message: message,
      display_msg: display_msg,
      request_id: getRequestHandler().request_id,
    },
    tab: tab,
  });
  // }, 200);
  // setTimeout(() => {
  //   clearInterval(interval);
  // }, 2000);
};

export default sendErrors;
