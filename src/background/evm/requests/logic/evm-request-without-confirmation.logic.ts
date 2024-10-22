import {
  EvmMethodPermissionMap,
  EvmRequestMethod,
} from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmEventName, EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { sendEvmEventFromSW } from 'src/content-scripts/hive/web-interface/response.logic';
import Logger from 'src/utils/logger.utils';

export const evmRequestWithoutConfirmation = async (
  requestHandler: EvmRequestHandler,
  tab: number,
  request: EvmRequest,
  domain: string,
) => {
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
    case EvmRequestMethod.REQUEST_ACCOUNTS: {
      message.value.result = [];
      const hasPermission = await EvmWalletUtils.hasPermission(
        domain,
        EvmMethodPermissionMap[request.method]!,
      );
      console.log({ hasPermission });
      if (hasPermission) {
        const connectedWallets = await EvmWalletUtils.getConnectedWallets(
          domain,
        );
        console.log({ connectedWallets });
        message.value.result = connectedWallets;
      }
      // sendEvmEventFromSW(EvmEventName.ACCOUNT_CHANGED, message.value.result);
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
    case EvmRequestMethod.GET_TRANSACTION_BY_HASH_AND_INDEX:
    case EvmRequestMethod.GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX: {
      message.value.result =
        await EvmRequestsUtils.getTransactionByBlockAndIndex(
          request.params[0],
          request.params[1],
        );
      break;
    }

    case EvmRequestMethod.GET_TRANSACTION_BY_HASH: {
      message.value.result = await EvmRequestsUtils.getTransactionByHash(
        request.params[0],
      );
      break;
    }
    case EvmRequestMethod.GET_TRANSACTION_COUNT_FOR_ADDRESS: {
      message.value.result =
        await EvmRequestsUtils.getTransactionCountForAddress(
          request.params[0],
          request.params[1],
        );
      break;
    }

    case EvmRequestMethod.GET_TRANSACTION_RECEIPT: {
      message.value.result = await EvmRequestsUtils.getTransactionReceipt(
        request.params[0],
      );
      break;
    }

    case EvmRequestMethod.PERSONAL_RECOVER: {
      message.value.result = await EvmRequestsUtils.personalRecover(
        request.params[0],
        request.params[1],
      );
      break;
    }

    case EvmRequestMethod.WALLET_REVOKE_PERMISSION: {
      await EvmWalletUtils.disconnectAllWallets(domain);
      await EvmWalletUtils.revokeAllPermissions(domain);
      message.value.result = null;
      sendEvmEventFromSW(EvmEventName.ACCOUNT_CHANGED, []);
      break;
    }

    case EvmRequestMethod.WEB3_CLIENT_VERSION: {
      message.value.result =
        chrome.runtime.getManifest().name +
        '/' +
        chrome.runtime.getManifest().version;
      break;
    }

    case EvmRequestMethod.WALLET_GET_PERMISSIONS: {
      const permissions = await EvmWalletUtils.getWalletPermission(domain);
      message.value.result = permissions.map((perm) => {
        return { parentCapability: perm };
      });
      break;
    }

    default: {
      try {
        Logger.info('Default functions');
        message.value.result = await EvmRequestsUtils.call(
          request.method,
          request.params,
        );
      } catch (err) {
        console.log(err);
        Logger.info(`${request.method} is not implemented`);
      }
      break;
    }
  }
  requestHandler.closeWindow();
  chrome.tabs.sendMessage(tab, message);
};
