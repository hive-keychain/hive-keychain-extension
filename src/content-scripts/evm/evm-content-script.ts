import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EVM_SUBSCRIPTION_PORT_NAME,
  EvmEventName,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
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

let subscriptionPort: chrome.runtime.Port | undefined;
let subscriptionHeld = false;

const isTopFrame = () => {
  try {
    return window.top === window;
  } catch {
    return false;
  }
};

const connectSubscriptionPort = () => {
  if (!isTopFrame() || subscriptionPort) return;
  try {
    const port = chrome.runtime.connect({ name: EVM_SUBSCRIPTION_PORT_NAME });
    subscriptionPort = port;
    port.onDisconnect.addListener(() => {
      if (subscriptionPort !== port) return;
      subscriptionPort = undefined;
      if (subscriptionHeld) connectSubscriptionPort();
    });
  } catch {
    subscriptionPort = undefined;
  }
};

const holdSubscriptionPort = () => {
  subscriptionHeld = true;
  connectSubscriptionPort();
};

const releaseSubscriptionPort = () => {
  subscriptionHeld = false;
  const port = subscriptionPort;
  subscriptionPort = undefined;
  port?.disconnect();
};

const forwardEvmEvent = (event: RoutedEvmEvent) => {
  if (event.eventType === EvmEventName.ETH_SUBSCRIPTION_HOLD) {
    holdSubscriptionPort();
    return;
  }
  if (event.eventType === EvmEventName.ETH_SUBSCRIPTION_RELEASE) {
    releaseSubscriptionPort();
    return;
  }
  sendEventToEvm(event);
};

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
      forwardEvmEvent(backgroundMessage.value as RoutedEvmEvent);
    }
  },
);
