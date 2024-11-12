import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';

export const unlockWallet = (
  requestHandler: HiveRequestsHandler | EvmRequestHandler,
  tab: number,
  request: KeychainRequest | EvmRequest,
  dappInfo: string | EvmDappInfo,
  unlockCommand: DialogCommand,
) => {
  /* istanbul ignore next */
  createPopup(async () => {
    chrome.runtime.sendMessage({
      command: unlockCommand,
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: await chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab,
      dappInfo,
    });
  }, requestHandler);
};
