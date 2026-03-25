import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import {
  sendErrorToEvm,
  sendEventToEvm,
  sendEvmChainToBackground,
  sendEvmRequestToBackground,
  sendResponseToEvm,
} from 'src/content-scripts/hive/web-interface/response.logic';

document.addEventListener(EvmEventName.REQUEST, async (request: any) => {
  sendEvmRequestToBackground(request.detail, chrome);
});

document.addEventListener(
  EvmEventName.SEND_BACK_CHAIN_TO_BACKGROUND,
  (event: any) => {
    sendEvmChainToBackground(event.detail, chrome);
  },
);

chrome.runtime.onMessage.addListener(
  (
    backgroundMessage: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
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
