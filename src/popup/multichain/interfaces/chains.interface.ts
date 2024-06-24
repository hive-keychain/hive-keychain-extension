import { SVGIcons } from 'src/common-ui/icons.enum';

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
}

export interface Chain {
  name: string;
  type?: ChainType;
  logo: SVGIcons | string;
  chainId: string;
  testnet?: boolean;
  blockExplorer?: BlockExplorer;
  blockExplorerApi?: BlockExplorer;
  network?: string;

  // TODO remove optional
  rpc?: MultichainRpc;
}

export enum BlockExporerType {
  ETHERSCAN = 'ETHERSCAN',
}

export interface BlockExplorer {
  url: string;
  type: BlockExporerType;
}

export interface EvmChain extends Chain {
  type: ChainType.EVM;
  mainToken: EvmMainToken;
  providers?: EvmProviders;
  isEth?: boolean;
}

export interface EvmProviders {}

export interface HiveChain extends Chain {
  type: ChainType.HIVE;
  mainTokens: HiveMainTokens;
}
