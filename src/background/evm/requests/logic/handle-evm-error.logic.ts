import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import {
  getRequestHandlers,
  willCloseDialogWindowAfterRemovingRequest,
} from '@background/multichain/dialog-request.utils';
import {
  EvmRequest,
  ProviderRpcErrorItem,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  DIALOG_FEEDBACK_DISPLAY_MS,
  delayMs,
} from '@reference-data/dialog-feedback.constants';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

export const handleEvmError = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  providerError: ProviderRpcErrorItem,
  errorMessage: string,
  errorMessageParams: string[],
  hideDialog?: boolean,
) => {
  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_ERROR,
    value: {
      requestId: request.request_id,
      error: { code: providerError.code, message: providerError.message },
    },
  };
  CommunicationUtils.tabsSendMessage(tab, message);

  if (!hideDialog) {
    const callback = async () => {
      CommunicationUtils.runtimeSendMessage({
        command: DialogCommand.SEND_DIALOG_ERROR,
        msg: {
          display_msg: await chrome.i18n.getMessage(
            errorMessage,
            errorMessageParams,
          ),
          tab,
        },
      });
      const handlers = await getRequestHandlers();
      if (
        await willCloseDialogWindowAfterRemovingRequest(
          handlers,
          request.request_id,
          tab,
        )
      ) {
        await delayMs(DIALOG_FEEDBACK_DISPLAY_MS);
      }
      await requestHandler.removeRequestById(request.request_id, tab);
    };
    createOrUpdateDialog(callback, requestHandler);
  } else {
    await requestHandler.removeRequestById(request.request_id, tab);
  }
};
