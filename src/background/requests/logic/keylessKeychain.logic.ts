import { createPopup } from '@background/requests/dialog-lifecycle';
import { RequestsHandler } from '@background/requests/request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
      data: request,
      domain,
      tab,
    });
  };
  createPopup(callback, requestHandler);
};
