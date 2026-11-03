import {
  EvmMethodPermissionMap,
  EvmRequestMethod,
} from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import MkModule from '@background/hive/modules/mk.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmDappInfo,
  EvmRequest,
  getErrorFromEtherJS,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  emitAccountsChangedIfNeeded,
  getAccountsForOrigin,
  removeWhitelistedChainsForOrigin,
  setChainIdForOrigin,
} from 'src/background/evm/evm-provider-state.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';
import { getPendingRequestMessageOptions } from '@background/multichain/pending-request.interface';
import { EvmCallBatchModule } from '@background/evm/evm-call-batch.module';
import { EvmSubscriptionModule } from '@background/evm/evm-subscription.module';
import { EvmTransactionSubmissionModule } from '@background/evm/evm-transaction-submission.module';

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
        dappInfo.origin,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        message.value.result = await EvmWalletUtils.getConnectedWallets(
          dappInfo.origin,
        );
      }
      break;
    }
    case EvmRequestMethod.WALLET_GET_CAPABILITIES: {
      try {
        message.value.result = await EvmCallBatchModule.getCapabilities(
          request.params,
          dappInfo.origin,
        );
      } catch (error) {
        const rpcError = error as { code?: number; message?: string };
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: {
              code: typeof rpcError.code === 'number' ? rpcError.code : -32000,
              message: rpcError.message ?? 'Capability discovery failed',
            },
          },
        };
      }
      break;
    }
    case EvmRequestMethod.WALLET_GET_CALLS_STATUS: {
      try {
        message.value.result = await EvmTransactionSubmissionModule.getStatus(
          request.params[0],
          dappInfo.origin,
        );
        void EvmTransactionSubmissionModule.reconcile().catch(() =>
          Logger.warn('EVM submission recovery failed'),
        );
      } catch {
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: { code: 5730, message: 'Unknown batch identifier' },
          },
        };
      }
      break;
    }
    case EvmRequestMethod.GET_CHAIN: {
      message.value.result = await EvmChainUtils.getLastEvmChainIdForOrigin(
        dappInfo.origin,
      );
      break;
    }
    case EvmRequestMethod.GET_NETWORK: {
      message.value.result = Number(
        await EvmChainUtils.getLastEvmChainIdForOrigin(dappInfo.origin),
      );
      break;
    }
    case EvmRequestMethod.REQUEST_ACCOUNTS: {
      message.value.result = [];
      const hasPermission = await EvmWalletUtils.hasPermission(
        dappInfo.origin,
        EvmMethodPermissionMap[request.method]!,
      );
      if (hasPermission) {
        const connectedWallets = await EvmWalletUtils.getConnectedWallets(
          dappInfo.origin,
        );
        message.value.result = connectedWallets;
      }
      await emitAccountsChangedIfNeeded(
        dappInfo.origin,
        [],
        message.value.result as string[],
      );
      break;
    }
    case EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN: {
      const requestedChainId = (request.params[0] as { chainId: string }).chainId;
      await setChainIdForOrigin(dappInfo.origin, requestedChainId, {
        tabId: tab,
      });
      message.value.result = null;
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
      const prevAccounts = await getAccountsForOrigin(dappInfo.origin);
      await EvmWalletUtils.revokeAllPermissions(dappInfo.origin);
      await removeWhitelistedChainsForOrigin(dappInfo.origin);
      const revokedRequests =
        await requestHandler.removePendingAccountRequestsForOrigin(
          dappInfo.origin,
        );
      await Promise.all(
        revokedRequests.map(async (requestData) => {
          if (!requestData.request || requestData.tab == null) return;
          await CommunicationUtils.tabsSendMessage(
            requestData.tab,
            {
              command: BackgroundCommand.SEND_EVM_ERROR,
              value: {
                requestId: requestData.request.request_id,
                error: ProviderRpcErrorList.unauthorized,
              },
            },
            getPendingRequestMessageOptions(
              requestData.dappInfo?.requestSource,
            ),
          );
        }),
      );
      message.value.result = null;
      await emitAccountsChangedIfNeeded(dappInfo.origin, prevAccounts, []);
      break;
    }

    case EvmRequestMethod.SUBSCRIBE:
    case EvmRequestMethod.UNSUBSCRIBE:
    case EvmRequestMethod.NEW_FILTER:
    case EvmRequestMethod.NEW_BLOCK_FILTER:
    case EvmRequestMethod.NEW_PENDING_TRANSACTION_FILTER:
    case EvmRequestMethod.GET_FILTER_CHANGES:
    case EvmRequestMethod.GET_FILTER_LOGS:
    case EvmRequestMethod.UNINSTALL_FILTER: {
      try {
        const chainId =
          request.chainId ??
          (await EvmChainUtils.getLastEvmChainIdForOrigin(dappInfo.origin));
        message.value.result = await EvmSubscriptionModule.handle({
          method: request.method,
          params: request.params,
          tabId: tab,
          frameId: dappInfo.requestSource?.frameId,
          origin: dappInfo.origin,
          chainId,
        });
      } catch (error) {
        const rpcError = error as { code?: number; message?: string };
        message = {
          command: BackgroundCommand.SEND_EVM_ERROR,
          value: {
            requestId: request.request_id,
            error: {
              code: typeof rpcError.code === 'number' ? rpcError.code : -32000,
              message: rpcError.message ?? 'Subscription request failed',
            },
          },
        };
      }
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
        dappInfo.origin,
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
  await requestHandler.removeRequestByLocator({
    requestId: request.request_id,
    tab,
    origin: dappInfo.origin,
    frameId: dappInfo.requestSource?.frameId,
    documentId: dappInfo.requestSource?.documentId,
  });
  CommunicationUtils.tabsSendMessage(
    tab,
    message,
    getPendingRequestMessageOptions(dappInfo.requestSource),
  );
  await EvmSubscriptionModule.flushNotifications();
};
