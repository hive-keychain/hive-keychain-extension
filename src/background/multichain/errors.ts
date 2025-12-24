import { EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { isWhitelisted } from 'src/utils/preferences.utils';

// Send errors back to the content_script, it will forward it to website
/* istanbul ignore next */
const sendErrors = async (
  tab: number,
  error: string,
  message: string,
  display_msg: string,
  request: KeychainRequest | EvmRequest,
) => {
  if (!(request as KeychainRequest).type) {
    const req = request as KeychainRequest;
    const noConfirm = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    );
    if (
      !isWhitelisted(noConfirm as NoConfirm, req, req.domain!, {
        uri: req.rpc,
        testnet: false,
      } as Rpc)
    ) {
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
    }
  } else {
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
  }
};

export default sendErrors;
