import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

/* istanbul ignore next */
export const onRemoveEvm = async (id: number) => {
  const requestHandler = await EvmRequestHandler.getFromLocalStorage();
  const { windowId, request, request_id, tab, confirmed } = requestHandler.data;
  if (id == windowId && !confirmed && tab) {
    CommunicationUtils.tabsSendMessage(tab!, {
      command: DialogCommand.ANSWER_EVM_REQUEST,
      msg: {
        success: false,
        error: 'user_cancel',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('bgd_lifecycle_request_canceled'),
        request_id,
      },
    });

    requestHandler.reset(true);
  }
};
