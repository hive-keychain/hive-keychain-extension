import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { RequestsHandler } from '@background/requests/request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const missingKey = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  username: string,
  typeWif: string,
) => {
  createPopup(async () => {
    sendErrors(
      requestHandler,
      tab!,
      'user_cancel',
      await chrome.i18n.getMessage('bgd_auth_canceled'),
      await chrome.i18n.getMessage('bgd_auth_no_key', [username, typeWif]),
      request,
    );
  }, requestHandler);
};
