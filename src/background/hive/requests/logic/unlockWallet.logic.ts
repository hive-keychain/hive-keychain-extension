import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createPopup } from '@background/multichain/dialog-lifecycle';
import { EvmDappInfo, EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { UnlockDialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

export const unlockWallet = (
  requestHandler: HiveRequestsHandler | EvmRequestHandler,
  tab: number,
  request: KeychainRequest | EvmRequest,
  dappInfo: string | EvmDappInfo,
  unlockCommand: UnlockDialogCommand,
) => {
  /* istanbul ignore next */
  createPopup(async () => {
    CommunicationUtils.runtimeSendMessage({
      command: unlockCommand as UnlockDialogCommand,
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: await chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      // @ts-ignore
      tab,
      dappInfo,
    });
  }, requestHandler);
};
