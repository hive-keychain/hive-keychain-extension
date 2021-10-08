import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const missingKey = (
  tab: number,
  request: KeychainRequest,
  username: string,
  typeWif: string,
) => {
  createPopup(() => {
    sendErrors(
      tab!,
      'user_cancel',
      chrome.i18n.getMessage('bgd_auth_canceled'),
      chrome.i18n.getMessage('bgd_auth_no_key', [username, typeWif]),
      request,
    );
  });
};
