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

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

export interface EvmConnectedWallets {
  [domain: string]: string[];
}

export interface EvmRequest {
  request_id: number;
  method: EvmRequestMethod;
  params: any[];
}

export enum EvmRequestMethod {
  GET_ACCOUNTS = 'eth_accounts',
  GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
  GET_CHAIN = 'eth_chainId',
  GET_NETWORK = 'net_version',
  REQUEST_ACCOUNTS = 'eth_requestAccounts',
}

export enum EvmEventName {
  ACCOUNT_CHANGED = 'accountChanged',
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
