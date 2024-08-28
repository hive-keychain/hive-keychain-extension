import { createPopup } from '@background/dialog-lifecycle';
import sendErrors from '@background/errors';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const initializeWallet = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
) => {
  /* istanbul ignore next */
  createPopup(async () => {
    sendErrors(
      requestHandler,
      tab,
      'no_wallet',
      await chrome.i18n.getMessage('bgd_init_no_wallet'),
      await chrome.i18n.getMessage('bgd_init_no_wallet_explained'),
      request,
    );
  }, requestHandler);
};
