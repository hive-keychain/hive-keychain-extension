import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { UnrestrictedMethodsEnum } from '@background/evm/requests/init';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

export const evmRequestWithoutConfirmation = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  domain: string,
) => {
  //TODO:Implement all unrestricted methods
  switch (request.method as unknown as UnrestrictedMethodsEnum) {
    case UnrestrictedMethodsEnum.wallet_revokePermissions: {
      await EvmWalletUtils.disconnectAllWallets(domain);
      const message: BackgroundMessage = {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: {
          requestId: request.request_id,
          result: null,
        },
      };
      chrome.tabs.sendMessage(tab, message);
      //TODO: Notify all tabs that the permissions have been revoked
    }
    default:
      break;
  }
};
