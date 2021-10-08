import { createPopup } from '@background/requests/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const addAccountToEmptyWallet = (
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(() => {
    chrome.runtime.sendMessage({
      command: 'sendDialogError',
      msg: {
        success: false,
        error: 'register',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('popup_html_register'),
        display_msg: chrome.i18n.getMessage('popup_html_register'),
      },
      tab,
      domain,
    });
  });
};
