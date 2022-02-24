import { RequestsHandler } from '@background/requests';
import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const addAccountRequest = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  account?: LocalAccount,
) => {
  if (account) {
    createPopup(() => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        chrome.i18n.getMessage('bgd_auth_canceled'),
        chrome.i18n.getMessage('popup_accounts_already_registered', [
          account.name,
        ]),
        request,
      );
    }, requestHandler);
  } else {
    const callback = () => {
      chrome.runtime.sendMessage({
        command: DialogCommand.SEND_DIALOG_CONFIRM,
        data: request,
        domain,
        tab,
      });
    };
    createPopup(callback, requestHandler);
  }
};
