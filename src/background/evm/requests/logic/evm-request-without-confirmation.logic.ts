import {
  EvmMethodPermissionMap,
  EvmRequestMethod,
} from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmDappInfo,
  EvmEventName,
  EvmRequest,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
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
  dappInfo: EvmDappInfo,
) => {
  let message: BackgroundMessage = {
    command: BackgroundCommand.SEND_EVM_RESPONSE,
    value: {
      requestId: request.request_id,
      result: {},
    },
  };

  switch (request.method) {
    // case EvmRequestMethod.GET_BALANCE: {
    //   message.value.result = await EvmRequestsUtils.getBalance(
    //     request.params[0],
    //     request.params[1],
    //   );
    //   break;
    // }
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
        dappInfo.domain,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        const connectedWallets = await EvmWalletUtils.getConnectedWallets(
          dappInfo.domain,
        );
        message.value.result = connectedWallets;
      }
      sendEvmEventFromSW(EvmEventName.ACCOUNT_CHANGED, message.value.result);
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
      await EvmWalletUtils.disconnectAllWallets(dappInfo.domain);
      await EvmWalletUtils.revokeAllPermissions(dappInfo.domain);
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
      const permissions = await EvmWalletUtils.getWalletPermission(
        dappInfo.domain,
      );
      message.value.result = permissions.map((perm) => {
        return { parentCapability: perm };
      });
      break;
    }

    case EvmRequestMethod.KC_RESOLVE_ENS: {
      try {
        message.value.result = await EvmRequestsUtils.resolveEns(
          request.params[0],
        );
      } catch (err) {
        const error = err as any;
        console.log({ error });
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: getErrorFromEtherJS(error.code, error.shortMessage),
          },
        };
      }
      break;
    }
    case EvmRequestMethod.KC_LOOKUP_ENS: {
      try {
        message.value.result = await EvmRequestsUtils.lookupEns(
          request.params[0],
        );
      } catch (err) {
        const error = err as any;
        console.log({ error });
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: getErrorFromEtherJS(error.code, error.shortMessage),
          },
        };
      }
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
        const error = err as any;
        console.log({ error });
        let value;
        if (!!error.error && !!error.error.code) {
          value = error.error;
        } else if (!!error.info && error.info?.info.error) {
          value = error.info?.info.error;
        }

        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: value,
          },
        };
        // Logger.info(`${request.method} is not implemented`);
      }
      break;
    }
  }

  requestHandler.closeWindow();
  chrome.tabs.sendMessage(tab, message);
};
