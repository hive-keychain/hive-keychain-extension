import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const missingKey = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  username: string,
  typeWif: string,
) => {
  /* istanbul ignore next */
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
