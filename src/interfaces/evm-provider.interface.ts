import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

export interface RequestArguments {
  id?: string;
  method: string;
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
  ACCOUNT_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
}

export interface KeychainEvmRequestWrapper {
  command: BackgroundCommand;
  domain: string;
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
  methodNotSupported: {
    code: -32004,
    message: 'Method not supported.',
  },
  requestLimitExceeded: {
    code: -32005,
    message: 'Request limit exceeded.',
  },
};

export interface EvmWalletPermissions {
  [domain: string]: EvmRequestMethod[];
}
