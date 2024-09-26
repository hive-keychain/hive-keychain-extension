import { EvmRequest } from '@interfaces/evm-provider.interface';
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

export const sendEvmRequestToBackground = (
  req: EvmRequest,
  chrome: typeof globalThis.chrome,
) => {
  chrome.runtime.sendMessage({
    command: 'sendEvmRequest',
    request: req,
    domain: window.location.hostname,
    request_id: req.request_id,
  });
};

export const sendIncompleteDataResponse = (
  value: KeychainRequest,
  error: string | Joi.ValidationError,
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
  sendResponse(response);
};
/* istanbul ignore next */
export const sendResponse = (response: RequestResponse) => {
  console.log(response);
  if (response.data?.redirect_uri) {
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

export const sendResponseToEvm = (response: any) => {
  if (response.data?.redirect_uri) {
    window.location.href = response.data.redirect_uri;
  } else {
    window.postMessage(
      {
        type: 'evm_keychain_response',
        response,
      },
      window.location.origin,
    );
  }
};

export const sendErrorToEvm = (response: any) => {
  if (response.data?.redirect_uri) {
    window.location.href = response.data.redirect_uri;
  } else {
    window.postMessage(
      {
        type: 'evm_keychain_error',
        response,
      },
      window.location.origin,
    );
  }
};

export const sendEventToEvm = (event: any) => {
  window.postMessage(
    {
      type: 'evm_keychain_event',
      event,
    },
    window.location.origin,
  );
};
