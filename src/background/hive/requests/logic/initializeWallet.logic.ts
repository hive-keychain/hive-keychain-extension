import { createPopup } from '@background/hive/requests/dialog-lifecycle';
import sendErrors from '@background/hive/requests/errors';
import { RequestsHandler } from '@background/hive/requests/request-handler';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const initializeWallet = (
  requestHandler: RequestsHandler,
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
