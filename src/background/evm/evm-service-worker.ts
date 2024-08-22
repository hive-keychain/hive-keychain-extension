import {
  EvmRequestMethod,
  KeychainEvmRequestWrapper,
} from '@background/evm/evm-request.interface';
import { BackgroundMessage } from '@background/hive/background-message.interface';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Logger.info('Starting EVM service worker');
};

const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  if (backgroundMessage.command === BackgroundCommand.SEND_EVM_REQUEST) {
    Logger.log('Background message', backgroundMessage);
    const request = (backgroundMessage as KeychainEvmRequestWrapper).request;
    switch (request.method) {
      case EvmRequestMethod.GET_CHAIN: {
        const chain = await EvmChainUtils.getLastEvmChain();
        console.log({ eth_chainId: chain });

        chrome.runtime.sendMessage({
          command: BackgroundCommand.SEND_EVM_RESPONSE,
          value: chain,
        } as BackgroundMessage);
      }
      case EvmRequestMethod.GET_ACCOUNTS: {
        return {};
      }
      case EvmRequestMethod.REQUEST_ACCOUNTS: {
        const chain = await EvmChainUtils.getLastEvmChain();
        console.log(chain);
        return EvmActiveAccountUtils.getSavedActiveAccountWallet(chain, []);
      }
      default: {
        Logger.info(`${request.method} is not implemented`);
      }
    }
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

export const EvmServiceWorker = { initializeServiceWorker };
