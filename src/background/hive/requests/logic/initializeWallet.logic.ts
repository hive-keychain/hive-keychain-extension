import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const initializeWallet = (
  requestHandler: HiveRequestsHandler | EvmRequestHandler,
  tab: number,
  request: KeychainRequest | EvmRequest,
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
