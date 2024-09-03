import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

export const evmRequestWithoutConfirmation = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  domain: string,
) => {
  // const evmRequestWrapper = backgroundMessage as KeychainEvmRequestWrapper;
  //     const request = evmRequestWrapper.request;
  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_RESPONSE,
    value: {
      requestId: request.request_id,
      result: {},
    },
  };
  //TODO:Implement all unrestricted methods
  switch (request.method) {
    case EvmRequestMethod.GET_CHAIN: {
      const chainId = await EvmChainUtils.getLastEvmChain();
      message.value.result = chainId;
      break;
    }
    case EvmRequestMethod.GET_NETWORK: {
      const chainId = await EvmChainUtils.getLastEvmChain();
      message.value.result = Number(chainId);
      break;
    }
    case EvmRequestMethod.GET_ACCOUNTS:
    case EvmRequestMethod.REQUEST_ACCOUNTS: {
      const connectedWallets = await EvmWalletUtils.getConnectedWallets(domain);
      if (connectedWallets.length > 0) {
        message.value.result = connectedWallets;
      }

      break;
    }

    case EvmRequestMethod.WALLET_REVOKE_PERMISSION: {
      await EvmWalletUtils.disconnectAllWallets(domain);
      message.value = null;

      //TODO: Notify all tabs that the permissions have been revoked
    }
    default: {
      Logger.info(`${request.method} is not implemented`);
      break;
    }
  }
  chrome.tabs.sendMessage(tab, message);
};
