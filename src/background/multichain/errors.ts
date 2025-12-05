import { EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

// Send errors back to the content_script, it will forward it to website
/* istanbul ignore next */
const sendErrors = (
  tab: number,
  error: string,
  message: string,
  display_msg: string,
  request: KeychainRequest | EvmRequest,
) => {
  CommunicationUtils.runtimeSendMessage({
    command: DialogCommand.SEND_DIALOG_ERROR,
    msg: {
      success: false,
      error: error,
      result: null,
      data: request,
      message: message,
      display_msg: display_msg,
      request_id: request.request_id,
    },
    tab: tab,
  });
};

export default sendErrors;
