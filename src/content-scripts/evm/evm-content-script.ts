import { BackgroundMessage } from '@background/hive/background-message.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  sendEvmRequestToBackground,
  sendResponseToEvm,
} from 'src/content-scripts/hive/web-interface/response.logic';
import Logger from 'src/utils/logger.utils';

const setupInjection = () => {
  console.log('trying to inject keychain');
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./evmWebInterfaceBundle.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};

document.addEventListener('requestEvm', async (request: any) => {
  sendEvmRequestToBackground(request.detail, chrome);
});

chrome.runtime.onMessage.addListener(
  (
    backgroundMessage: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
    if (backgroundMessage.command === BackgroundCommand.SEND_EVM_RESPONSE) {
      console.log('hello');
      sendResponseToEvm(backgroundMessage.value);
    }
  },
);

setupInjection();
