import { initializeEvmProviderRegistration } from '@background/evm/evm-provider-registration';
import { setAccountsForOrigin } from '@background/evm/evm-provider-state.utils';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
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
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { TransactionResponse } from 'ethers';
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
    case BackgroundCommand.SEND_EVM_REQUEST: {
      let requestHandler = await EvmRequestHandler.getFromLocalStorage();
      if (!requestHandler) {
        requestHandler = new EvmRequestHandler();
      }
      await requestHandler.sendRequest(
        sender,
        backgroundMessage as KeychainEvmRequestWrapper,
      );

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
          initEvmRequestHandler(
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
      if (requestId === null || requestId === undefined) {
        break;
      }
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      const requestData = requestHandler?.getRequestData(requestId);
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
        await setAccountsForOrigin(
          requestData.dappInfo.origin,
          message.providerState.accounts,
        );
      }

      CommunicationUtils.tabsSendMessage(requestData?.tab!, {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: {
          requestId,
          result: message.result,
        },
      });

      requestHandler.removeRequestById(requestId, requestData?.tab!);
      break;
    }
    case BackgroundCommand.ACCEPT_EVM_TRANSACTION:
      const { request, tab, domain, extraData } = backgroundMessage.value;
      performEvmOperation(
        await EvmRequestHandler.getFromLocalStorage(),
        request,
        tab,
        domain,
        extraData,
      );

      break;

    case BackgroundCommand.REJECT_EVM_TRANSACTION: {
      const { request, tab, domain } = backgroundMessage.value;
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      CommunicationUtils.tabsSendMessage(tab, {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: request.request_id,
          error: ProviderRpcErrorList.userReject as ProviderRpcError,
        },
      });
      requestHandler.removeRequestById(request.request_id, tab);
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

        CommunicationUtils.tabsSendMessage(
          activeTab.id,
          {
            command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
            value: { eventType: EvmEventName.GET_CHAIN_FROM_PROVIDER },
          },
        );
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

      initEvmRequestHandler(
        request,
        tab,
        dappInfo,
        await EvmRequestHandler.getFromLocalStorage(),
      );
      break;
    }
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

export const EvmServiceWorker = { initializeServiceWorker };
