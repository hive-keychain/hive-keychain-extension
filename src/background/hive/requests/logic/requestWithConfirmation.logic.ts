import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const requestWithConfirmation = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  /* istanbul ignore next */
  const callback = () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      data: request,
      domain,
      tab,
      rpc: current_rpc,
      hiveEngineConfig: requestHandler.hiveEngineConfig,
    });
  };
  createPopup(callback, requestHandler);
};
