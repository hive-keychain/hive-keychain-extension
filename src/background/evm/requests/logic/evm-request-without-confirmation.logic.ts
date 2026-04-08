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
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';
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
