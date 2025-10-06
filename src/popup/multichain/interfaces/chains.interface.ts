import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';

export enum ChainType {
  HIVE = 'HIVE',
  EVM = 'EVM',
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
  type?: ChainType;
  logo: string;
  chainId: string;
  testnet?: boolean;
  blockExplorer?: BlockExplorer;
  blockExplorerApi?: BlockExplorer;
  network?: string;
  rpcs: MultichainRpc[];
  isPopular?: boolean;
}

export enum BlockExplorerType {
  BLOCKSCOUT = 'BLOCKSCOUT',
  ETHERSCAN = 'ETHERSCAN',
  AVALANCHE_SCAN = 'AVALANCHE_SCAN',
}

export interface BlockExplorer {
  url: string;
  type: BlockExplorerType;
}

export interface EvmChain extends Chain {
  type: ChainType.EVM;
  mainToken: EvmMainToken;
  providers?: EvmProviders;
  isEth?: boolean;
  defaultTransactionType: EvmTransactionType;
  onlyCustomFee?: boolean;
  network?: string;
  addTokensManually?: boolean;
  disableTokensAndHistoryAutoLoading?: boolean;
  manualDiscoverAvailable?: boolean;
  openSeaChainId?: string;
}

export interface EvmProviders {}

export interface HiveChain extends Chain {
  type: ChainType.HIVE;
  mainTokens: HiveMainTokens;
}
