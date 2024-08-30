import { EvmRequest } from '@background/evm/provider/evm-provider.interface';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const evmRequestWithConfirmation = (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  domain: string,
) => {
  /* istanbul ignore next */
  const callback = () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM_EVM,
      data: request,
      domain,
      tab,
      accounts: requestHandler.accounts,
    });
  };
  createPopup(callback, requestHandler);
};
