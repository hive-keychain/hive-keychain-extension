import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import sendErrors from '@background/multichain/errors';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const initializeWallet = (
  requestHandler: HiveRequestsHandler | EvmRequestHandler,
  tab: number,
  request: KeychainRequest | EvmRequest,
) => {
  /* istanbul ignore next */
  createOrUpdateDialog(async () => {
    sendErrors(
      tab,
      'no_wallet',
      await chrome.i18n.getMessage('bgd_init_no_wallet'),
      await chrome.i18n.getMessage('bgd_init_no_wallet_explained'),
      request,
    );
    // await requestHandler.removeRequestById(request.request_id, tab);
  }, requestHandler);
};
