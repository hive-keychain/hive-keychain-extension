import {
  EvmRequestMethod,
  KeychainEvmRequestWrapper,
} from '@background/evm/provider/evm-provider.interface';
import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { initEvmRequestHandler } from '@background/evm/requests/init';
import MkModule from '@background/hive/modules/mk.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
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

      const evmRequestWrapper = backgroundMessage as KeychainEvmRequestWrapper;
      const request = evmRequestWrapper.request;
      const message: BackgroundMessage = {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: {
          requestId: request.request_id,
          result: {},
        },
      };

      switch (request.method) {
        case EvmRequestMethod.GET_CHAIN: {
          const chainId = await EvmChainUtils.getLastEvmChain();
          message.value.result = chainId;
          break;
        }
        case EvmRequestMethod.GET_NETWORK: {
          const chainId = await EvmChainUtils.getLastEvmChain();
          message.value.result = Number(chainId);
          break;
        }
        case EvmRequestMethod.GET_ACCOUNTS:
        case EvmRequestMethod.REQUEST_ACCOUNTS: {
          const connectedWallets = await EvmWalletUtils.getConnectedWallets(
            evmRequestWrapper.domain,
          );
          if (connectedWallets.length > 0) {
            message.value.result = connectedWallets;
          } else {
            const requestHandler =
              await EvmRequestHandler.getFromLocalStorage();
            if (requestHandler) {
              requestHandler.closeWindow();
            }
            new EvmRequestHandler().sendRequest(
              sender,
              backgroundMessage as KeychainEvmRequestWrapper,
            );
            break;
          }

          break;
        }
        default: {
          Logger.info(`${request.method} is not implemented`);
        }
      }
      chrome.tabs.sendMessage(sender.tab?.id!, message);
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
      console.log('evm background', backgroundMessage);
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
    case BackgroundCommand.SEND_BACK_CONNECTED_WALLETS: {
      const connectedAddresses = [];
      const connectedAccount = backgroundMessage.value.connectedAccounts;
      for (const address of Object.keys(connectedAccount)) {
        if (connectedAccount[address]) {
          await EvmWalletUtils.connectWallet(
            address,
            backgroundMessage.value.data.domain,
          );
          connectedAddresses.push(address);
        }
      }

      const message: BackgroundMessage = {
        command: BackgroundCommand.SEND_EVM_RESPONSE,
        value: {
          requestId: backgroundMessage.value.data.data.request_id,
          result: connectedAddresses,
        },
      };
      chrome.tabs.sendMessage(sender.tab?.id!, message);
    }
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

export const EvmServiceWorker = { initializeServiceWorker };
