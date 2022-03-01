import { RequestsHandler } from '@background/requests';
import { createPopup } from '@background/requests/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const addAccountToEmptyWallet = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.REGISTER,
      msg: {
        success: false,
        error: 'register',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('popup_html_register'),
        display_msg: await chrome.i18n.getMessage('popup_html_register'),
      },
      tab,
      domain,
    });
  }, requestHandler);
};
