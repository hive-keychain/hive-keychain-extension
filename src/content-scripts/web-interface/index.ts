// Content script interfacing the website and the extension

import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { KeychainRequestWrapper } from 'src/content-scripts/keychain-request-wrapper.type';
import {
  cancelPreviousRequest,
  sendIncompleteDataResponse,
  sendRequestToBackground,
} from 'src/content-scripts/web-interface/response.logic';
import { WebInterfaceUtils } from 'src/content-scripts/web-interface/web-interface.utils';
import { KeychainRequest } from 'src/interfaces/keychain.interface';

let req: KeychainRequest | null = null;

// Injecting Keychain
WebInterfaceUtils.setupInjection();

// Answering the handshakes
document.addEventListener('swHandshake_hive', () => {
  window.postMessage(
    {
      type: 'hive_keychain_handshake',
    },
    window.location.origin,
  );
});

// Answering the requests

const requestHandler = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) => {
  console.log(message, sender);
  if (message.command === DialogCommand.ANSWER_REQUEST) {
    sendResponse(message.msg);
    req = null;
  }
};

document.addEventListener('swRequest_hive', (request: object) => {
  const prevReq = req;
  req = (request as KeychainRequestWrapper).detail;
  const { error, value } = WebInterfaceUtils.validateRequest(req);
  if (!error) {
    sendRequestToBackground(value);
    if (prevReq) {
      cancelPreviousRequest(prevReq);
    }
  } else {
    sendIncompleteDataResponse(value!, error);
    req = prevReq;
  }
});

chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    console.log(message, sender);
  },
);

// Get notification from the background upon request completion and pass it back to the dApp.
chrome.runtime.onMessage.addListener(requestHandler);
