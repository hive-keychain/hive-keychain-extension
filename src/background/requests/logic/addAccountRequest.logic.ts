import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { RequestsHandler } from '@background/requests/request-handler';
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
    /* istanbul ignore next */
    createPopup(async () => {
      sendErrors(
        requestHandler,
        tab!,
        'user_cancel',
        await chrome.i18n.getMessage('bgd_auth_canceled'),
        await chrome.i18n.getMessage('popup_accounts_already_registered', [
          account.name,
        ]),
        request,
      );
    }, requestHandler);
  } else {
    /* istanbul ignore next */
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
