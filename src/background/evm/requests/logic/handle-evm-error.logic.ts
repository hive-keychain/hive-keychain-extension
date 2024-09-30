import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import {
  EvmRequest,
  ProviderRpcErrorItem,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const handleEvmError = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  domain: string,
  providerError: ProviderRpcErrorItem,
  errorMessage: string,
  errorMessageParams: string[],
) => {
  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_ERROR,
    value: {
      requestId: request.request_id,
      result: { code: providerError.code, message: providerError.message },
    },
  };
  chrome.tabs.sendMessage(tab, message);

  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_ERROR,
      msg: {
        display_msg: await chrome.i18n.getMessage(
          errorMessage,
          errorMessageParams,
        ),
      },
    });
  };
  createPopup(callback, requestHandler);
};
