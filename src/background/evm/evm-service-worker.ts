import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { initEvmRequestHandler } from '@background/evm/requests/init';
import { performEvmOperation } from '@background/evm/requests/operations/perform-operation';
import MkModule from '@background/hive/modules/mk.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { KeychainEvmRequestWrapper } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Logger.info('Starting EVM service worker');
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
            chrome.tabs.sendMessage(tab.id, {
              ...backgroundMessage,
              command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
            });
        }
      });
      break;
    }
    case BackgroundCommand.UNLOCK_FROM_DIALOG: {
      const { mk, domain, data, tab } = backgroundMessage.value;
      if (data.command === DialogCommand.UNLOCK_EVM) {
        const login = await MkModule.login(mk);
        if (login) {
          MkModule.saveMk(mk);
          initEvmRequestHandler(
            data.msg.data,
            tab,
            domain,
            await EvmRequestHandler.getFromLocalStorage(),
          );
        } else {
          chrome.runtime.sendMessage({
            ...data,
            command: DialogCommand.WRONG_MK,
          });
        }
      }

      break;
    }
    case BackgroundCommand.SEND_EVM_RESPONSE_TO_SW: {
      console.log('ici');
      const requestHandler = await EvmRequestHandler.getFromLocalStorage();
      chrome.tabs.sendMessage(requestHandler.data.tab!, {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: backgroundMessage.value,
      });
      requestHandler.closeWindow();
      break;
    }
    case BackgroundCommand.ACCEPT_EVM_TRANSACTION:
      const { data, tab, domain } = backgroundMessage.value;
      performEvmOperation(
        await EvmRequestHandler.getFromLocalStorage(),
        data,
        tab,
        domain,
      );
      break;
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

export const EvmServiceWorker = { initializeServiceWorker };
