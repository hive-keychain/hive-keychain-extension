import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
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
  // const request = evmRequestWrapper.request;
  const message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_RESPONSE,
    value: {
      requestId: request.request_id,
      result: {},
    },
  };
  //TODO: Implement all unrestricted methods
  switch (request.method) {
    case EvmRequestMethod.ESTIMATE_GAS_FEE: {
      message.value.result = EvmRequestsUtils.estimateGasFee();
      break;
    }
    case EvmRequestMethod.GET_BALANCE: {
      message.value.result = await EvmRequestsUtils.getBalance(
        request.params[0],
        request.params[1],
      );
      break;
    }
    case EvmRequestMethod.GET_CHAIN: {
      message.value.result = await EvmChainUtils.getLastEvmChainId();
      break;
    }
    case EvmRequestMethod.GET_NETWORK: {
      message.value.result = Number(await EvmChainUtils.getLastEvmChainId());
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
    case EvmRequestMethod.GET_BLOCK_NUMBER: {
      message.value.result = await EvmRequestsUtils.getBlockNumber();
      break;
    }
    case EvmRequestMethod.GET_BLOCK_BY_NUMBER:
    case EvmRequestMethod.GET_BLOCK_BY_HASH: {
      message.value.result = await EvmRequestsUtils.getBlock(
        request.params[0],
        request.params[1],
      );
      break;
    }

    case EvmRequestMethod.GET_CODE: {
      message.value.result = await EvmRequestsUtils.getCode(
        request.params[0],
        request.params[1],
      );
      break;
    }
    case EvmRequestMethod.GET_TRANSACTION_COUNT_BY_NUMBER:
    case EvmRequestMethod.GET_TRANSACTION_COUNT_BY_HASH: {
      message.value.result = await EvmRequestsUtils.getTransactionCountByBlock(
        request.params[0],
        request.params[1],
      );
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
  requestHandler.closeWindow();
  chrome.tabs.sendMessage(tab, message);
};
