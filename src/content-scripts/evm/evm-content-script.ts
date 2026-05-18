import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { validateEvmRequest } from 'src/content-scripts/evm/evm-request-validation';
import {
  sendErrorToEvm,
  sendEventToEvm,
  sendEvmChainToBackground,
  sendEvmInitializeProviderRequest,
  sendEvmRequestToBackground,
  sendResponseToEvm,
} from 'src/content-scripts/hive/web-interface/response.logic';

document.addEventListener(EvmEventName.REQUEST, async (request: any) => {
  try {
    const validatedRequest = validateEvmRequest(request.detail);
    sendEvmRequestToBackground(validatedRequest, chrome);
  } catch (error) {
    const requestId = request.detail?.request_id;
    sendErrorToEvm({
      requestId,
      request_id: requestId,
      error,
    });
  }
});

document.addEventListener(
  EvmEventName.SEND_BACK_CHAIN_TO_BACKGROUND,
  (event: any) => {
    sendEvmChainToBackground(event.detail, chrome);
  },
);

document.addEventListener(
  EvmEventName.INITIALIZE_PROVIDER_REQUEST,
  async (request: any) => {
    sendEvmInitializeProviderRequest();
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
