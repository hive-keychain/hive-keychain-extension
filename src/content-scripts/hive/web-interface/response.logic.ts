import { BackgroundMessage } from '@background/multichain/background-message.interface';
import {
  EvmEventName,
  EvmRequest,
  KeychainEvmRequestWrapper,
  ProviderRpcErrorList,
  RoutedEvmEvent,
} from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Joi from 'joi';
import {
  KeychainRequest,
  RequestResponse,
} from 'src/interfaces/keychain.interface';
import {
  getWindowHostname,
  getWindowOrigin,
} from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import KeychainifyUtils from 'src/utils/keychainify.utils';
import Logger from 'src/utils/logger.utils';
import { RequestPayloadUtils } from 'src/utils/request-payload.utils';

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
  const message = {
    command: BackgroundCommand.SEND_REQUEST,
    request: req,
    domain: getWindowHostname(),
    request_id: req.request_id,
  } as const;
  const payloadSize = RequestPayloadUtils.getRequestPayloadSize(message);
  if (payloadSize.byteSize === null) {
    sendIncompleteDataResponse(req, 'Invalid request.');
    return;
  }
  if (!payloadSize.isValid) {
    sendResponse({
      success: false,
      error: 'request_limit',
      result: null,
      message: 'Request size limit exceeded.',
      data: req,
      request_id: req.request_id,
    });
    return;
  }

  CommunicationUtils.runtimeSendMessage(message);
};

export const sendEvmRequestToBackground = async (
  req: EvmRequest,
  chrome: typeof globalThis.chrome,
) => {
  const link = document.querySelector("link[rel='icon']");

  const message = {
    command: BackgroundCommand.SEND_EVM_REQUEST,
    request: req,
    dappInfo: {
      origin: getWindowOrigin(),
      domain: getWindowHostname(),
      protocol: window.location.protocol,
      logo: (link as any)?.href,
    },
    request_id: req.request_id,
  } as KeychainEvmRequestWrapper;
  if (!RequestPayloadUtils.getRequestPayloadSize(message).isValid) {
    sendErrorToEvm({
      requestId: req.request_id,
      request_id: req.request_id,
      error: ProviderRpcErrorList.requestLimitExceeded,
    });
    return;
  }

  CommunicationUtils.runtimeSendMessage(message);
};
export const sendEvmChainToBackground = async (
  chainData: string | { chainId: string | null } | null,
  chrome: typeof globalThis.chrome,
) => {
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SEND_BACK_CHAIN_FROM_PROVIDER,
    value: chainData,
  });
};

export const sendEvmInitializeProviderRequest = async () => {
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SEND_EVM_INITIALIZE_PROVIDER_REQUEST,
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
  if (
    response.data?.redirect_uri &&
    KeychainifyUtils.isRedirectUriAcceptable(
      response.data.redirect_uri,
      window.location.href,
    )
  ) {
    window.location.href = response.data.redirect_uri;
  } else {
    try {
      window.postMessage(
        {
          type: 'hive_keychain_response',
          response,
        },
        getWindowOrigin(),
      );
    } catch (err) {
      Logger.error('send response', err);
    }
  }
};

export const sendResponseToEvm = (response: any) => {
  if (
    response.data?.redirect_uri &&
    KeychainifyUtils.isRedirectUriAcceptable(
      response.data.redirect_uri,
      window.location.href,
    )
  ) {
    window.location.href = response.data.redirect_uri;
  } else {
    try {
      window.postMessage(
        {
          type: 'evm_keychain_response',
          response,
        },
        getWindowOrigin(),
      );
    } catch (err) {
      Logger.error('send response to evm', err);
    }
  }
};

export const sendErrorToEvm = (response: any) => {
  if (
    response.data?.redirect_uri &&
    KeychainifyUtils.isRedirectUriAcceptable(
      response.data.redirect_uri,
      window.location.href,
    )
  ) {
    window.location.href = response.data.redirect_uri;
  } else {
    try {
      window.postMessage(
        {
          type: 'evm_keychain_error',
          response,
        },
        getWindowOrigin(),
      );
    } catch (err) {
      Logger.error('senderrortoEvm', err);
    }
  }
};

export const sendEventToEvm = (event: any) => {
  try {
    window.postMessage(
      {
        type: 'evm_keychain_event',
        event,
      },
      getWindowOrigin(),
    );
  } catch (err) {
    Logger.error('sendeventtoevm', err);
  }
};

export const sendEvmEvent = (event: RoutedEvmEvent) => {
  CommunicationUtils.runtimeSendMessage({
    command: BackgroundCommand.SEND_EVM_EVENT,
    value: event,
  } as BackgroundMessage);
};

export const sendEvmEventToTab = (
  tabId: number,
  eventType: EvmEventName,
  args?: any,
) => {
  sendEvmEvent({
    eventType,
    args,
    scope: { kind: 'tab', tabId },
  });
};

export const sendEvmEventToOrigin = (
  origin: string,
  eventType: EvmEventName,
  args?: any,
) => {
  sendEvmEvent({
    eventType,
    args,
    scope: { kind: 'origin', origin },
  });
};
