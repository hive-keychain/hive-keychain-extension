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
};

export default sendErrors;
