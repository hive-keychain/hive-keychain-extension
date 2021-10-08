import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';

export const addAccountRequest = (
  tab: number,
  request: KeychainRequest,
  domain: string,
  account?: LocalAccount,
) => {
  if (account) {
    createPopup(() => {
      sendErrors(
        tab!,
        'user_cancel',
        chrome.i18n.getMessage('bgd_auth_canceled'),
        chrome.i18n.getMessage('popup_accounts_already_registered', [
          account.name,
        ]),
        request,
      );
    });
  } else {
    const callback = () => {
      chrome.runtime.sendMessage({
        command: 'sendDialogConfirm',
        data: request,
        domain,
        tab,
      });
    };
    createPopup(callback);
  }
};
