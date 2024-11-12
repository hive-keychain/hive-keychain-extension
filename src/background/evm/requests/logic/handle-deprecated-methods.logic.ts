import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import {
  EvmDappInfo,
  EvmRequest,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import Logger from 'src/utils/logger.utils';

export const handleDeprecatedMethods = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  dappInfo: EvmDappInfo,
  errorMessage: string = 'dialog_evm_unsupported_method',
) => {
  Logger.warn(`${request.method} is not supported, rawError: ${errorMessage}`);

  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_ERROR,
    value: {
      requestId: request.request_id,
      result: ProviderRpcErrorList.unsupportedMethod,
    },
  };
  chrome.tabs.sendMessage(tab, message);

  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_ERROR,
      msg: {
        display_msg: await chrome.i18n.getMessage(errorMessage, [
          request.method,
        ]),
      },
    });
  };
  createPopup(callback, requestHandler);
};
