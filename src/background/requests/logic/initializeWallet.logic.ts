import { RequestsHandler } from '@background/requests';
import { createPopup } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const initializeWallet = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
) => {
  createPopup(() => {
    sendErrors(
      tab,
      'no_wallet',
      chrome.i18n.getMessage('bgd_init_no_wallet'),
      chrome.i18n.getMessage('bgd_init_no_wallet_explained'),
      request,
    );
  }, requestHandler);
};
