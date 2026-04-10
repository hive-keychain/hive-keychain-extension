import {
  BackgroundMessage,
  DialogMessage,
  MultisigDialogMessage,
} from '@background/multichain/background-message.interface';

const isNoReceiverError = (error: unknown) => {
  const message = error instanceof Error ? error.message : `${error ?? ''}`;
  return message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist');
};

const tabsSendMessage = async (
  tabId: number,
  message: BackgroundMessage | DialogMessage,
  onFail?: Function,
) => {
  try {
    const res = await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    if (!isNoReceiverError(err)) {
      console.log(err, 'error in tabsSendMessage');
    }
    if (onFail) onFail();
  }
};

const runtimeSendMessage = async (
  message: BackgroundMessage | DialogMessage | MultisigDialogMessage,
  onFail?: Function,
) => {
  try {
    const res = await chrome.runtime.sendMessage(message);
  } catch (err) {
    if (!isNoReceiverError(err)) {
      console.log(err, 'error in runtimeSendMessage');
    }
    if (onFail) onFail();
  }
};

export const CommunicationUtils = { tabsSendMessage, runtimeSendMessage };
