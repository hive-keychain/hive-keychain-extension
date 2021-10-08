import { createPopup } from '@background/requests/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';

export const requestWithConfirmation = (
  tab: number,
  request: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  const callback = () => {
    chrome.runtime.sendMessage({
      command: 'sendDialogConfirm',
      data: request,
      domain,
      tab,
      testnet: current_rpc.testnet,
    });
  };
  createPopup(callback);
};
