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
  ESTIMATE_GAS_FEE = 'eth_estimateGas',
  GET_ACCOUNTS = 'eth_accounts',
  GET_BALANCE = 'eth_getBalance',
  GET_BLOCK_NUMBER = 'eth_blockNumber',
  GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
  GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
  GET_CHAIN = 'eth_chainId',
  GET_CODE = 'eth_getCode',
  GET_HASH_RATE = 'eth_hashrate',
  GET_MINING = 'eth_mining',
  GET_NETWORK = 'net_version',
  GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
  GET_TRANSACTION_BY_HASH_AND_INDEX = 'eth_getTransactionByBlockHashAndIndex',
  GET_TRANSACTION_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getTransactionByBlockNumberAndIndex',
  GET_TRANSACTION_COUNT_BY_HASH = 'eth_getBlockTransactionCountByHash',
  GET_TRANSACTION_COUNT_BY_NUMBER = 'eth_getBlockTransactionCountByNumber',
  GET_TRANSACTION_COUNT_FOR_ADDRESS = 'eth_getTransactionCount',
  GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
  GET_UNCLE_BY_BLOCK_HASH_AND_INDEX = 'eth_getUncleByBlockHashAndIndex',
  GET_UNCLE_BY_BLOCK_NUMBER_AND_INDEX = 'eth_getUncleByBlockNumberAndIndex',
  GET_WORK = 'eth_getWork',
  REQUEST_ACCOUNTS = 'eth_requestAccounts',
  SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
  WALLET_REVOKE_PERMISSION = 'wallet_revokePermissions',
  WALLET_ADD_ETH_CHAIN = 'wallet_addEthereumChain',
  WALLET_GET_PERMISSIONS = 'wallet_getPermissions',
  WALLET_REQUEST_PERMISSIONS = 'wallet_requestPermissions',
  WALLET_REGISTER_ON_BOARDING = 'wallet_registerOnboarding',
  WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
  WALLET_WATCH_ASSETS = 'wallet_watchAsset',
  WALLET_INVOKE_KEYRING = 'wallet_invokeKeyring',
  WEB3_CLIENT_VERSION = 'web3_clientVersion',
  WEB3_SHA3 = 'web3_sha3',

  ETH_SIGN_DATA = 'eth_signTypedData',
  ETH_SIGN_DATA_1 = 'eth_signTypedData_v1',
  ETH_SIGN_DATA_3 = 'eth_signTypedData_v3',
  ETH_SIGN_DATA_4 = 'eth_signTypedData_v4',
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
