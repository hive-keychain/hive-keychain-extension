import { BackgroundCommand } from '@reference-data/background-message-key.enum';

export interface EvmRequest {
  request_id: number;
  method: EvmRequestMethod;
  params: any[];
}

export enum EvmRequestMethod {
  GET_CHAIN = 'eth_chainId',
  GET_ACCOUNTS = 'eth_accounts',
  REQUEST_ACCOUNTS = 'eth_requestAccounts',
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
