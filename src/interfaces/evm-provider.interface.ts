import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

export interface RequestArguments {
  id?: string;
  method: EvmRequestMethod;
  params?: unknown[] | object;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EvmConnectedWallets {
  [domain: string]: string[];
}

export interface EvmRequest {
  request_id: number;
  method: EvmRequestMethod;
  params: any[];
}

export enum EvmEventName {
  INITIALIZED = '_initialized',
  ACCOUNT_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
}

export interface EvmDappInfo {
  domain: string;
  protocol: string;
  logo: string;
}
export interface KeychainEvmRequestWrapper {
  command: BackgroundCommand;
  dappInfo: EvmDappInfo;
  request: EvmRequest;
  request_id: number;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface ProviderRpcErrorItem {
  code: number;
  message: string;
}

export const ProviderRpcErrorList: { [key: string]: ProviderRpcErrorItem } = {
  userReject: {
    code: 4001,
    message: 'The user rejected the request',
  },
  unauthorized: {
    code: 4100,
    message:
      'The requested method and/or account has not been authorized by the user',
  },
  unsupportedMethod: {
    code: 4200,
    message: 'The Provider does not support the requested method',
  },
  disconnected: {
    code: 4900,
    message: 'The Provider is disconnected from all chains',
  },
  chainDisconnected: {
    code: 4901,
    message: 'The Provider is not connected to the requested chain',
  },
  serverInvalidJSON: {
    code: -32700,
    message:
      'Invalid JSON was received by the server. An error occured on the server while parsing the JSON text.',
  },
  nonValidRequest: {
    code: -32600,
    message: 'The JSON sent is not a valid Request object',
  },
  nonExistingMethod: {
    code: -32601,
    message: 'The method does not exist / is not available.',
  },
  invalidMethodParams: {
    code: -32602,
    message: 'Invalid method parameter(s).',
  },
  unconfiguredEns: {
    code: -32602,
    message: 'The address uses an ENS but this one was not configured.',
  },
  interalJSONRPCError: {
    code: -32603,
    message: 'Internal JSON-RPC error.',
  },
  resourceNotFound: {
    code: -32001,
    message: 'Resource not found.',
  },
  resourceUnavailable: {
    code: -32002,
    message: 'Resource unavailable.',
  },
  transactionRejected: {
    code: -32003,
    message: 'Transaction rejected.',
  },
  transactionReverted: {
    code: -32003,
    message: 'Transaction reverted.',
  },
  insufficientFunds: {
    code: -32003,
    message: 'Insufficient funds.',
  },
  transactionReplaced: {
    code: -32003,
    message: 'Transaction replaced.',
  },
  methodNotSupported: {
    code: -32004,
    message: 'Method not supported.',
  },
  requestLimitExceeded: {
    code: -32005,
    message: 'Request limit exceeded.',
  },
  executionTimeout: {
    code: -32000,
    message: 'Execution timeout',
  },
  networkError: {
    code: -32011,
    message: 'Network error',
  },
  nounceTooLow: {
    code: -32000,
    message: 'Nounce too low',
  },
  gasLimitTooLow: {
    code: -32010,
    message: 'Gas limit was too low',
  },
  undeterminedError: {
    code: -1,
    message: 'Undetermined Error',
  },
  unknownError: {
    code: -1,
    message: 'Unknown error',
  },
};

export const getEvmProviderRpcError = (key: string) => {
  if (!key) return null;
  const error = ProviderRpcErrorList[key];
  return error ? error.message : ProviderRpcErrorList.unknownError.message;
};

export interface EvmWalletPermissions {
  [domain: string]: EvmWalletDomainPermissions;
}

export type EvmWalletDomainPermissions = {
  [key in EvmRequestPermission]?: string[];
};

export const getErrorFromEtherJS = (
  errorCode: string,
  errorExtraDetail?: string,
) => {
  let error: ProviderRpcErrorItem;
  switch (errorCode) {
    case 'NOT_IMPLEMENTED':
    case 'UNSUPPORTED_OPERATION':
      error = ProviderRpcErrorList.unsupportedMethod;
      break;
    case 'ACTION_REJECTED':
      error = ProviderRpcErrorList.userReject;
      break;
    case 'BAD_DATA':
    case 'BUFFER_OVERRUN':
    case 'INVALID_ARGUMENT':
    case 'MISSING_ARGUMENT':
    case 'UNEXPECTED_ARGUMENT':
      error = ProviderRpcErrorList.invalidMethodParams;
      break;
    case 'TIMEOUT':
      error = ProviderRpcErrorList.executionTimeout;
      break;
    case 'NETWORK_ERROR':
      error = ProviderRpcErrorList.networkError;
      break;
    case 'SERVER_ERROR':
      error = ProviderRpcErrorList.resourceUnavailable;
      break;
    case 'NONCE_EXPIRED':
      error = ProviderRpcErrorList.nounceTooLow;
      break;
    case 'REPLACEMENT_UNDERPRICED':
      error = ProviderRpcErrorList.transactionRejected;
      break;
    case 'CALL_EXCEPTION':
      error = ProviderRpcErrorList.transactionReverted;
      break;
    case 'TRANSACTION_REPLACED':
      error = ProviderRpcErrorList.transactionReplaced;
      break;
    case 'UNCONFIGURED_NAME':
      error = ProviderRpcErrorList.unconfiguredEns;
      break;
    case 'INSUFFICIENT_FUNDS':
      error = ProviderRpcErrorList.insufficientFunds;
      break;

    // TODO determine what kind of error it should be
    case 'CANCELLED':
    case 'NUMERIC_FAULT':
    case 'OFFCHAIN_FAULT':
      error = ProviderRpcErrorList.undeterminedError;
      break;

    case 'VALUE_MISMATCH':
    case 'UNKNOWN_ERROR':
    default: {
      error = ProviderRpcErrorList.unknownError;
      break;
    }
  }

  if (errorExtraDetail) {
    error = { ...error, message: error.message + ` - ${errorExtraDetail}` };
  }

  return error;
};
