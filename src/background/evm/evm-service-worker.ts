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
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Logger.info('Starting EVM service worker');

  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.url?.endsWith('.eth/')) {
      const regex = /(?:https?:\/\/)?([a-z0-9-]+\.eth)\b/i;
      const match = details.url.match(regex);
      if (match) {
        console.log('changing url');
        console.log(match[1]); // 👉 "stoodkev.eth"
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
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      if (requestHandler) {
        requestHandler.closeWindow();
      }
      new EvmRequestHandler().sendRequest(
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
      const { mk, data, tab } = backgroundMessage.value;

      if (data.command === DialogCommand.UNLOCK_EVM) {
        const login = await MkModule.login(mk);
        if (login) {
          await MkModule.saveMk(mk);
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
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      CommunicationUtils.tabsSendMessage(requestHandler.data.tab!, {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: backgroundMessage.value,
      });
      requestHandler.closeWindow();
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
      const { data, tab, domain } = backgroundMessage.value;
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      CommunicationUtils.tabsSendMessage(requestHandler.data.tab!, {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: {
          requestId: requestHandler.data.request_id,
          error: ProviderRpcErrorList.userReject as ProviderRpcError,
        },
      });
      requestHandler.closeWindow();
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
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

export const EvmServiceWorker = { initializeServiceWorker };
