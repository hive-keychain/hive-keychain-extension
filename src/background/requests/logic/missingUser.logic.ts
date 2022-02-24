import { RequestsHandler } from '@background/requests';
import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const missingUser = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  username: string,
) => {
  const callback = () => {
    sendErrors(
      tab!,
      'user_cancel',
      chrome.i18n.getMessage('bgd_auth_canceled'),
      chrome.i18n.getMessage('bgd_auth_no_account', [username]),
      request,
    );
  };
  createPopup(callback, requestHandler);
};
