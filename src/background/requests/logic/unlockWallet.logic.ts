import { createPopup } from '@background/requests/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const unlockWallet = (
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(() => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_ERROR,
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
