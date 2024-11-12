import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const evmRequestWithConfirmation = (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  dappInfo: EvmDappInfo,
) => {
  /* istanbul ignore next */
  const callback = () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM_EVM,
      data: request,
      dappInfo,
      tab,
      accounts: requestHandler.accounts,
    });
  };
  let height = 600;
  if (
    request.method === EvmRequestMethod.SEND_TRANSACTION ||
    request.method === EvmRequestMethod.SEND_RAW_TRANSACTION
  )
    height = 800;

  //TODO : change height here if needed, default is 600 for other windows. Check if we can avoid the glitch
  createPopup(callback, requestHandler, undefined, 800);
};
