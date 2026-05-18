import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { initializeEvmProviderRegistration } from '@background/evm/evm-provider-registration';
import {
  getAccountsForOrigin,
  persistEvmDappLogoForDomain,
  setAccountsForOrigin,
} from '@background/evm/evm-provider-state.utils';
import {
  EvmRequestHandler,
  EvmRequestLocator,
} from '@background/evm/requests/evm-request-handler';
import { initEvmRequestHandler } from '@background/evm/requests/init';
import { performEvmOperation } from '@background/evm/requests/operations/perform-operation';
import MkModule from '@background/hive/modules/mk.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmEventName,
  KeychainEvmRequestWrapper,
  ProviderRpcError,
  ProviderRpcErrorList,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { TransactionResponse } from 'ethers';
import { validateEvmRequest } from 'src/content-scripts/evm/evm-request-validation';
import { getOriginFromUrl } from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Object.assign(global, { contextType: 'service_worker' });

  Logger.info('Starting EVM service worker');
  initializeEvmProviderRegistration();
  void EvmTransactionsUtils.rehydratePendingTransactions();

  chrome.webNavigation.onBeforeNavigate.addListener((details: any) => {
    if (details.url?.endsWith('.eth/')) {
      const regex = /(?:https?:\/\/)?([a-z0-9-]+\.eth)\b/i;
      const match = details.url.match(regex);
      if (match) {
        chrome.tabs.update(details.tabId, {
          url: `https://app.ens.domains/${match[1]}`,
        });
      }
    }
  });
};

const sendEvmEventToTab = (tabId: number, event: RoutedEvmEvent) => {
  CommunicationUtils.tabsSendMessage(tabId, {
    command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
    value: event,
  });
};

const isOriginMatch = (tabUrl: string | undefined, origin: string) => {
  if (!tabUrl) return false;

  try {
    return getOriginFromUrl(tabUrl) === origin;
  } catch (error) {
    return false;
  }
};

const routeEvmEvent = (event: RoutedEvmEvent) => {
  switch (event.scope.kind) {
    case 'tab':
      sendEvmEventToTab(event.scope.tabId, event);
      break;
    case 'origin':
      const targetOrigin = event.scope.origin;
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id && isOriginMatch(tab.url, targetOrigin)) {
            sendEvmEventToTab(tab.id, event);
          }
        }
      });
      break;
    case 'global':
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            sendEvmEventToTab(tab.id, event);
          }
        }
      });
      break;
  }
};

const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  Logger.log('Background message evm service worker', backgroundMessage);

  switch (backgroundMessage.command) {
    case BackgroundCommand.SEND_EVM_INITIALIZE_PROVIDER_REQUEST: {
      const origin = getOriginFromUrl(sender.tab?.url);
      if (sender?.tab?.url && origin) {
        sendEvmEventToTab(sender.tab!.id!, {
          eventType: EvmEventName.INITIALIZE_PROVIDER_RESPONSE,
          scope: {
            kind: 'tab',
            tabId: sender.tab!.id!,
          },
          args: {
            chainId: await EvmChainUtils.getLastEvmChainIdForOrigin(origin),
            accounts: await getAccountsForOrigin(origin),
          },
        });
      }
      break;
    }
    case BackgroundCommand.SEND_EVM_REQUEST: {
      const evmMessage = backgroundMessage as KeychainEvmRequestWrapper;
      try {
        evmMessage.request = validateEvmRequest(evmMessage.request);
        evmMessage.request_id = evmMessage.request.request_id;
      } catch (error) {
        if (sender.tab?.id !== undefined) {
          const requestId = evmMessage.request?.request_id;
          CommunicationUtils.tabsSendMessage(sender.tab.id, {
            command: BackgroundCommand.SEND_EVM_ERROR,
            value: {
              requestId,
              request_id: requestId,
              error,
            },
          });
        }
        break;
      }

      let requestHandler = await EvmRequestHandler.getFromLocalStorage();
      if (!requestHandler) {
        requestHandler = new EvmRequestHandler();
      }
      await requestHandler.sendRequest(sender, evmMessage);

      break;
    }
    case BackgroundCommand.SEND_EVM_EVENT: {
      routeEvmEvent(backgroundMessage.value as RoutedEvmEvent);
      break;
    }
    case BackgroundCommand.UNLOCK_FROM_DIALOG: {
      const { mk, data, tab, request_id } = backgroundMessage.value;

      if (data.command === DialogCommand.UNLOCK_EVM) {
        const login = await MkModule.login(mk);
        if (login) {
          MkModule.saveMk(mk);
          await initEvmRequestHandler(
            data.msg.data,
            tab,
            data.dappInfo,
            await EvmRequestHandler.getFromLocalStorage(),
          );
        } else {
          CommunicationUtils.runtimeSendMessage({
            ...data,
            msg: { ...data.msg, wrongMk: true },
            command: DialogCommand.UNLOCK_EVM,
          });
        }
      }

      break;
    }
    case BackgroundCommand.SEND_EVM_RESPONSE_TO_SW: {
      const message = backgroundMessage.value;
      const requestId = message.requestId ?? message.request_id;
      const { tab, origin } = message;
      if (
        requestId === null ||
        requestId === undefined ||
        tab === null ||
        tab === undefined ||
        !origin
      ) {
        break;
      }
      const locator: EvmRequestLocator = { requestId, tab, origin };
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      const requestData = requestHandler?.getRequestDataByLocator(locator);
      if (requestData?.tab === null || requestData?.tab === undefined) {
        break;
      }

      if (
        requestData?.dappInfo?.origin &&
        requestData.request &&
        message.providerState?.accounts &&
        [
          EvmRequestMethod.REQUEST_ACCOUNTS,
          EvmRequestMethod.WALLET_REQUEST_PERMISSIONS,
        ].includes(requestData.request.method)
      ) {
        const accounts = await setAccountsForOrigin(
          requestData.dappInfo.origin,
          message.providerState.accounts,
        );
        await persistEvmDappLogoForDomain(
          requestData.dappInfo,
          accounts.length,
        );
      }

      await requestHandler.removeRequestByLocator(locator);

      CommunicationUtils.tabsSendMessage(requestData?.tab!, {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: {
          requestId,
          result: message.result,
        },
      });

      break;
    }
    case BackgroundCommand.ACCEPT_EVM_TRANSACTION:
      const { request, tab, domain, origin, extraData } =
        backgroundMessage.value;
      if (!origin) {
        break;
      }
      await performEvmOperation(
        await EvmRequestHandler.getFromLocalStorage(),
        request,
        tab,
        domain,
        origin,
        extraData,
      );

      break;

    case BackgroundCommand.REJECT_EVM_TRANSACTION: {
      const { request, tab, domain, origin } = backgroundMessage.value;
      if (!origin) {
        break;
      }
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      CommunicationUtils.tabsSendMessage(tab, {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: request.request_id,
          error: ProviderRpcErrorList.userReject as ProviderRpcError,
        },
      });
      await requestHandler.removeRequestByLocator({
        requestId: request.request_id,
        tab,
        origin,
      });
      break;
    }
    case BackgroundCommand.GET_CHAIN_FROM_PROVIDER: {
      // Query the active tab only to avoid broadcasting the bootstrap request
      // across every provider-enabled page.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const [activeTab] = tabs;
        if (!activeTab?.id) {
          return;
        }

        CommunicationUtils.tabsSendMessage(activeTab.id, {
          command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
          value: { eventType: EvmEventName.GET_CHAIN_FROM_PROVIDER },
        });
      });
      break;
    }
    case BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER: {
      // Content scripts already publish this extension-wide runtime message.
      // Forwarding it from the service worker loops the same command back here.
      break;
    }
    case BackgroundCommand.WAIT_FOR_EVM_TRANSACTION_CONFIRMATION: {
      const value = backgroundMessage.value;
      const transactionResponse = new TransactionResponse(
        value.transactionResponse,
        await EthersUtils.getProvider(value.chain as EvmChain),
      );
      EvmPendingTransactionsNotifications.waitForTransaction(
        transactionResponse,
      );
      break;
    }
    case BackgroundCommand.ACCEPT_ADD_EVM_CHAIN: {
      const { request, tab, dappInfo, requestedChain } =
        backgroundMessage.value;

      await ChainUtils.addChainToSetupChains(requestedChain);

      await initEvmRequestHandler(
        request,
        tab,
        dappInfo,
        await EvmRequestHandler.getFromLocalStorage(),
      );
      break;
    }
    case BackgroundCommand.ACCEPT_ADD_CUSTOM_EVM_CHAIN: {
      const { request, tab, dappInfo, requestedChain } =
        backgroundMessage.value as {
          request: KeychainEvmRequestWrapper['request'];
          tab: number;
          dappInfo: KeychainEvmRequestWrapper['dappInfo'];
          requestedChain: EvmChain;
        };
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();

      await ChainUtils.addCustomChain(requestedChain);
      if (requestedChain.rpcs.length > 0) {
        await EvmRpcUtils.setActiveRpc(requestedChain.rpcs[0], requestedChain);
      }
      await requestHandler?.setRequestDialogByLocator(
        {
          requestId: request.request_id,
          tab,
          origin: dappInfo.origin,
        },
        undefined,
        undefined,
      );
      await initEvmRequestHandler(request, tab, dappInfo, requestHandler);
      break;
    }
  }
};

const previewEvmDecryptMessage = async (
  locator: EvmRequestLocator,
): Promise<string> => {
  const requestHandler = await EvmRequestHandler.getFromLocalStorage();
  if (!requestHandler) {
    throw new Error('No request handler');
  }
  const requestData = requestHandler.getRequestDataByLocator(locator);
  const request = requestData?.request;
  if (!request?.params?.[0] || !request?.params?.[1]) {
    throw new Error('Invalid decrypt request');
  }
  const account = requestHandler.accounts.find((account: EvmAccount) => {
    return (
      account.wallet.address.toLowerCase() ===
      String(request.params[1]).toLowerCase()
    );
  });
  if (!account) {
    throw new Error('Account not found');
  }
  return EvmRequestsUtils.decryptMessage(account, request.params[0]);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message &&
    typeof message === 'object' &&
    (message as BackgroundMessage).command ===
      BackgroundCommand.PREVIEW_EVM_DECRYPT
  ) {
    const value = (
      message as {
        value?: { request_id?: number; tab?: number; origin?: string };
      }
    ).value;
    const request_id = value?.request_id;
    if (request_id == null || value?.tab == null || !value.origin) {
      sendResponse({ success: false, error: 'Missing request locator' });
      return true;
    }
    void previewEvmDecryptMessage({
      requestId: request_id,
      tab: value.tab,
      origin: value.origin,
    })
      .then((plaintext) => sendResponse({ success: true, plaintext }))
      .catch((err) =>
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    return true;
  }
  return chromeMessageHandler(
    message as BackgroundMessage,
    sender,
    sendResponse,
  );
});

export const EvmServiceWorker = { initializeServiceWorker };
