// Content script interfacing the website and the extension
/* istanbul ignore file */
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { validateHiveRequest } from 'src/content-scripts/hive/web-interface/hive-request-validation';
import {
  sendIncompleteDataResponse,
  sendRequestToBackground,
  sendResponse,
} from 'src/content-scripts/hive/web-interface/response.logic';
import { KeychainRequest } from 'src/interfaces/keychain.interface';
import Logger from 'src/utils/logger.utils';
if (window.chrome) {
  //@ts-ignore
  window.chrome.storage = undefined;
}

// let req: KeychainRequest | null = null;

// Injecting Keychain

const setupInjection = () => {
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./hive_keychain.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};
setupInjection();
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
type KeychainRequestWrapper = {
  detail: KeychainRequest;
};
document.addEventListener('swRequest_hive', (request: object) => {
  // const prevReq = req;
  const req = (request as KeychainRequestWrapper).detail;
  const validation = validateHiveRequest(req);
  const { error, value } = validation;
  if (!error && value) {
    sendRequestToBackground(value, chrome);
    // if (prevReq) {
    //   cancelPreviousRequest(prevReq);
    // }
  } else {
    sendIncompleteDataResponse(value!, error ?? 'Invalid request.');
    // req = prevReq;
  }
});

// Get notification from the background upon request completion and pass it back to the dApp.
chrome.runtime.onMessage.addListener(function (obj, sender, sendResp) {
  if (
    obj.command === DialogCommand.ANSWER_REQUEST ||
    obj.command === DialogCommand.SEND_HIVE_RESPONSE
  ) {
    sendResponse(obj.msg);
    // req = null;
  }
});
