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
} from '@interfaces/evm-provider.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmPendingTransactionsNotifications } from '@popup/evm/utils/evm-pending-transactions-notifications.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { TransactionResponse } from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Object.assign(global, { contextType: 'service_worker' });

  Logger.info('Starting EVM service worker');

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
      requestHandler.sendRequest(
        sender,
        backgroundMessage as KeychainEvmRequestWrapper,
      );

      break;
    }
    case BackgroundCommand.SEND_EVM_EVENT: {
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id)
            CommunicationUtils.tabsSendMessage(tab.id, {
              ...backgroundMessage,
              command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
            });
        }
      });
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
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      const requestData = requestHandler?.getRequestData(message.request_id);
      CommunicationUtils.tabsSendMessage(requestData?.tab!, {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: message,
      });

      requestHandler.removeRequestById(message.request_id, requestData?.tab!);
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
      // from background to content script
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            CommunicationUtils.tabsSendMessage(
              tab.id,
              {
                command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
                value: { eventType: EvmEventName.GET_CHAIN_FROM_PROVIDER },
              },
              () => {
                CommunicationUtils.runtimeSendMessage({
                  command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
                  value: { chainId: null },
                });
              },
            );
          }
        }
      });
      break;
    }
    case BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER: {
      // from content script to popup
      CommunicationUtils.runtimeSendMessage({
        ...backgroundMessage,
      });
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
