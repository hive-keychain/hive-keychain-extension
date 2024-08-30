import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const addAccountToEmptyWallet = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  /* istanbul ignore next */
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
