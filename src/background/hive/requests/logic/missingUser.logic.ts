import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const missingUser = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  username: string,
) => {
  /* istanbul ignore next */
  const callback = async () => {
    sendErrors(
      requestHandler,
      tab!,
      'user_cancel',
      await chrome.i18n.getMessage('bgd_auth_canceled'),
      await chrome.i18n.getMessage('bgd_auth_no_account', [username]),
      request,
    );
  };
  createPopup(callback, requestHandler);
};
