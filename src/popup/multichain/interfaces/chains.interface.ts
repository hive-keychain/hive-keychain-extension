import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';

export enum ChainType {
  HIVE = 'HIVE',
  EVM = 'EVM',
  NONE = 'NONE',
}

export interface HiveMainTokens {
  hbd: string;
  hive: string;
  hp: string;
}
export type EvmMainToken = string;

export interface MultichainRpc {
  url: string;
  isDefault?: boolean;
}

export interface Chain {
  name: string;
  type: ChainType;
  logo: string;
  chainId: string;
  /** Present on chains from the API / stored config; not user-edited in custom-chain form. */
  active?: boolean;
  testnet?: boolean;
  blockExplorer?: BlockExplorer;
  blockExplorerApi?: BlockExplorer;
  network?: string;
  rpcs: MultichainRpc[];
  isPopular?: boolean;
  /** When `true`, the chain was added by the user (custom EVM chains list). Omitted on default/API chains. */
  isCustom?: boolean;
}

export enum BlockExplorerType {
  BLOCKSCOUT = 'BLOCKSCOUT',
  ETHERSCAN = 'ETHERSCAN',
  AVALANCHE_SCAN = 'AVALANCHE_SCAN',
}

export interface BlockExplorer {
  url: string;
  /** When omitted (e.g. API payloads), callers may infer explorer behavior from the URL. */
  type?: BlockExplorerType;
}

export interface EvmChain extends Chain {
  type: ChainType.EVM;
  mainToken: EvmMainToken;
  nativeCoinId?: string;
  providers?: EvmProviders;
  isEth?: boolean;
  defaultTransactionType: EvmTransactionType;
  onlyCustomFee?: boolean;
  network?: string;
  addTokensManually?: boolean;
  disableTokensAndHistoryAutoLoading?: boolean;
  manualDiscoverAvailable?: boolean;
  openSeaChainId?: string;
  manualLoadHistory?: boolean;
}

export interface EvmProviders {}

export interface HiveChain extends Chain {
  type: ChainType.HIVE;
  mainTokens: HiveMainTokens;
}
