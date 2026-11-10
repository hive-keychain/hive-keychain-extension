import {
  BackgroundMessage,
  DialogMessage,
  MultisigDialogMessage,
} from '@background/multichain/background-message.interface';
import Logger from 'src/utils/logger.utils';

const isNoReceiverError = (error: unknown) => {
  const message = error instanceof Error ? error.message : `${error ?? ''}`;
  return message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist');
};

const tabsSendMessage = async (
  tabId: number,
  message: BackgroundMessage | DialogMessage,
  options?: chrome.tabs.MessageSendOptions,
  onFail?: Function,
) => {
  try {
    const res = options
      ? await chrome.tabs.sendMessage(tabId, message, options)
      : await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    if (!isNoReceiverError(err)) {
      Logger.error(err, 'error in tabsSendMessage');
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
      Logger.error(err, 'error in runtimeSendMessage');
    }
    if (onFail) onFail();
  }
};

// Firefox delivers chrome.runtime.sendMessage replies only through the
// callback. Awaiting the return value resolves to undefined there.
const sendRuntimeMessageForResponse = (
  message: BackgroundMessage | DialogMessage | MultisigDialogMessage,
): Promise<any> =>
  new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error, response?: any) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve(response);
    };

    let returned: unknown;
    try {
      returned = chrome.runtime.sendMessage(message, (response) => {
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError?.message) {
          finish(new Error(runtimeError.message));
          return;
        }
        finish(undefined, response);
      });
    } catch (error) {
      finish(error instanceof Error ? error : new Error(String(error)));
      return;
    }

    if (
      returned !== null &&
      returned !== undefined &&
      typeof (returned as { then?: unknown }).then === 'function'
    ) {
      void Promise.resolve(returned as Promise<any>).then(
        (response) => finish(undefined, response),
        (error: unknown) =>
          finish(error instanceof Error ? error : new Error(String(error))),
      );
    }
  });

export const CommunicationUtils = {
  tabsSendMessage,
  runtimeSendMessage,
  sendRuntimeMessageForResponse,
};
