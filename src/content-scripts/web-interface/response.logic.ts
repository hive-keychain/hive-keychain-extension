import { PluginMessage } from 'hive-keychain-commons/lib/plugins';
import Joi from 'joi';
import {
  KeychainRequest,
  RequestResponse,
} from 'src/interfaces/keychain.interface';

export const cancelPreviousRequest = (prevReq: KeychainRequest) => {
  const response = {
    success: false,
    error: 'ignored',
    result: null,
    message: 'User ignored this transaction',
    data: prevReq,
    request_id: prevReq.request_id,
  };
  sendResponse(response);
};

export const sendRequestToBackground = (
  req: KeychainRequest,
  chrome: typeof globalThis.chrome,
) => {
  chrome.runtime.sendMessage({
    command: 'sendRequest',
    request: req,
    domain: window.location.hostname,
    request_id: req.request_id,
  });
};

export const sendIncompleteDataResponse = (
  value: KeychainRequest,
  error: string | Joi.ValidationError,
  senderId?: string,
) => {
  let message = typeof error === 'string' ? error : error.stack!;
  var response = {
    success: false,
    error: 'incomplete',
    result: null,
    message,
    data: value,
    request_id: value.request_id,
  };
  if (!!senderId) {
    sendExternalResponse(response, senderId);
  } else {
    sendResponse(response);
  }
};
/* istanbul ignore next */
export const sendResponse = (response: RequestResponse) => {
  if (response.data.redirect_uri) {
    window.location.href = response.data.redirect_uri;
  } else {
    window.postMessage(
      {
        type: 'hive_keychain_response',
        response,
      },
      window.location.origin,
    );
  }
};

/* istanbul ignore next */
export const sendExternalResponse = (response: any, senderId: string) => {
  const resp = {
    command: PluginMessage.HIVE_KEYCHAIN_RESPONSE,
    response,
  };
  chrome.runtime.sendMessage(senderId, resp);
};
