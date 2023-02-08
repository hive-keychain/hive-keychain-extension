// Content script interfacing the website and the extension

import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { KeychainRequestWrapper } from 'src/content-scripts/keychain-request-wrapper.type';
import {
  cancelPreviousRequest,
  sendIncompleteDataResponse,
  sendRequestToBackground,
  sendResponse,
} from 'src/content-scripts/web-interface/response.logic';
import { WebInterfaceUtils } from 'src/content-scripts/web-interface/web-interface.utils';
import { KeychainRequest } from 'src/interfaces/keychain.interface';
import { KeychainRequestsUtils } from 'src/utils/keychain-requests.utils';

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

document.addEventListener('swRequest_hive', (request: object) => {
  //console.log(request);
  const prevReq = req;
  req = (request as KeychainRequestWrapper).detail;
  const { error, value } = KeychainRequestsUtils.validateRequest(req);
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

// Get notification from the background upon request completion and pass it back to the dApp.
chrome.runtime.onMessage.addListener(function (obj, sender) {
  if (obj.command === DialogCommand.ANSWER_REQUEST) {
    //console.log('response', obj.msg);
    sendResponse(obj.msg);
    req = null;
  }
});
