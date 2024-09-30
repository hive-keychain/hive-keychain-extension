import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import {
  EvmRequest,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import Logger from 'src/utils/logger.utils';

export const handleNonExistingMethod = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  domain: string,
) => {
  Logger.warn(
    `${request.method} doesn't exist, rawError: dialog_evm_non_existing_method`,
  );

  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_ERROR,
    value: {
      requestId: request.request_id,
      result: ProviderRpcErrorList.nonExistingMethod,
    },
  };
  chrome.tabs.sendMessage(tab, message);

  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_ERROR,
      msg: {
        display_msg: await chrome.i18n.getMessage(
          'dialog_evm_non_existing_method',
          [request.method],
        ),
      },
    });
  };
  createPopup(callback, requestHandler);
};
