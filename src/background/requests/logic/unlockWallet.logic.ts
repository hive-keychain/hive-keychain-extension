import { createPopup } from '@background/requests/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const unlockWallet = (
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(() => {
    chrome.runtime.sendMessage({
      command: 'sendDialogError',
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: request,
        message: chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab,
      domain,
    });
  });
};
