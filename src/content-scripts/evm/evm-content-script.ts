import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  sendErrorToEvm,
  sendEventToEvm,
  sendEvmRequestToBackground,
  sendResponseToEvm,
} from 'src/content-scripts/hive/web-interface/response.logic';
import Logger from 'src/utils/logger.utils';

const setupInjection = () => {
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./evmKeychainBundle.js');
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
    console.log({ backgroundMessage });

    if (backgroundMessage.command === BackgroundCommand.SEND_EVM_RESPONSE) {
      sendResponseToEvm(backgroundMessage.value);
    } else if (backgroundMessage.command === BackgroundCommand.SEND_EVM_ERROR) {
      sendErrorToEvm(backgroundMessage.value);
    } else if (
      backgroundMessage.command ===
      BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT
    ) {
      sendEventToEvm(backgroundMessage.value!);
    }
  },
);

setupInjection();
