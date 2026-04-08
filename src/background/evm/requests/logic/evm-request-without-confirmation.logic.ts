import {
  EvmMethodPermissionMap,
  EvmRequestMethod,
} from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import MkModule from '@background/hive/modules/mk.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmDappInfo,
  EvmRequest,
  ProviderRpcErrorItem,
  ProviderRpcErrorList,
  getErrorFromEtherJS,
} from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  getWalletPermissionsResponse,
  getWalletRequestPermissionsResponse,
  validateWalletRequestPermissionsParams,
} from 'src/background/evm/requests/logic/wallet-request-permissions.logic';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { ObjectUtils } from 'src/utils/object.utils';

const validateWalletRevokePermissionsParams = (
  params: unknown,
): {
  permission?: EvmRequestPermission;
  error?: ProviderRpcErrorItem;
} => {
  if (!params || !Array.isArray(params) || params.length !== 1) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const requestedPermissions = params[0];
  if (!ObjectUtils.isPureObject(requestedPermissions)) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const permissionKeys = Object.keys(requestedPermissions);
  if (permissionKeys.length !== 1) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const requestedPermission = permissionKeys[0];
  if (
    !(Object.values(EvmRequestPermission) as string[]).includes(
      requestedPermission,
    )
  ) {
    return { error: ProviderRpcErrorList.unsupportedMethod };
  }

  if (
    !ObjectUtils.isPureObject(
      (requestedPermissions as Record<string, unknown>)[requestedPermission],
    )
  ) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  return {
    permission: requestedPermission as EvmRequestPermission,
  };
};

const validateWalletSwitchEthereumChainParams = (
  params: unknown,
): {
  chainId?: string;
  error?: ProviderRpcErrorItem;
} => {
  if (!params || !Array.isArray(params) || params.length !== 1) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const requestedChain = params[0];
  if (!ObjectUtils.isPureObject(requestedChain)) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  const chainId = (requestedChain as Record<string, unknown>).chainId;
  if (typeof chainId !== 'string' || !/^0x[0-9a-fA-F]+$/.test(chainId)) {
    return { error: ProviderRpcErrorList.invalidMethodParams };
  }

  return { chainId };
};

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
    case EvmRequestMethod.GET_ACCOUNTS: {
      message.value.result = [];
      const mk = await MkModule.getMk();
      if (!mk) {
        break;
      }
      const hasPermission = await EvmWalletUtils.hasPermission(
        dappInfo.domain,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        message.value.result = await EvmWalletUtils.getConnectedWallets(
          dappInfo.domain,
        );
      }
      break;
    }
    case EvmRequestMethod.WALLET_GET_CAPABILITIES: {
      message.value.result = await EvmRequestsUtils.getWalletCapabilities();
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
        dappInfo.domain,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        const connectedWallets = await EvmWalletUtils.getConnectedWallets(
          dappInfo.domain,
        );
        message.value.result = connectedWallets;
      }
      break;
    }
    case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
      const { chainId, error } = validateWalletSwitchEthereumChainParams(
        request.params,
      );

      if (error) {
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error,
          },
        };
        break;
      }

      const requestedChain = await ChainUtils.getChain<EvmChain>(chainId!);
      if (!requestedChain) {
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: ProviderRpcErrorList.chainNotAdded,
          },
        };
        break;
      }

      await EvmChainUtils.setActiveEvmChain(requestedChain);
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.ACTIVE_CHAIN,
        requestedChain.chainId,
      );

      message.value.result = null;
      break;
    }
    case EvmRequestMethod.WALLET_REQUEST_PERMISSIONS: {
      const { permission, error } = validateWalletRequestPermissionsParams(
        request.params,
      );

      if (error) {
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error,
          },
        };
        break;
      }

      const hasPermission = await EvmWalletUtils.hasPermission(
        dappInfo.domain,
        permission!,
      );
      if (!hasPermission) {
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: ProviderRpcErrorList.unauthorized,
          },
        };
        break;
      }

      message.value.result = getWalletRequestPermissionsResponse(permission!);
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
      const { permission, error } = validateWalletRevokePermissionsParams(
        request.params,
      );

      if (error) {
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error,
          },
        };
        break;
      }

      await EvmWalletUtils.removeWalletPermission(dappInfo.domain, permission!);
      message.value.result = null;
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
      const permissions = await EvmWalletUtils.getWalletPermissionFull(
        dappInfo.domain,
      );
      message.value.result = getWalletPermissionsResponse(
        dappInfo.domain,
        permissions,
      );
      break;
    }

    case EvmRequestMethod.KC_RESOLVE_ENS: {
      try {
        message.value.result = await EvmRequestsUtils.resolveEns(
          request.params[0],
        );
      } catch (err) {
        const error = err as any;
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
        message.value.result = await EvmRequestsUtils.getEnsForAddress(
          request.params[0],
        );
      } catch (err) {
        const error = err as any;
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
    // case EvmRequestMethod.ESTIMATE_GAS_FEE: {
    //   message.value.result = await EvmRequestsUtils.estimateGasFee();
    //   break;
    // }

    default: {
      try {
        Logger.info('Default functions');
        message.value.result = await EvmRequestsUtils.call(
          request.method,
          request.params,
        );
      } catch (err) {
        const error = err as any;
        let value;
        if (!!error.error && !!error.error.code) {
          value = error.error;
        } else if (!!error.info && error.info?.info.error) {
          value = error.info?.info.error;
        }

        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            request_id: request.request_id,
            error: value,
          },
        };
        // Logger.info(`${request.method} is not implemented`);
      }
      break;
    }
  }
  // if ((await RequestHandlerUtils.countPendingRequest()) === 1) {
  //   requestHandler.closeWindow();
  // }
  requestHandler.removeRequestById(request.request_id, tab);
  CommunicationUtils.tabsSendMessage(tab, message);
};
