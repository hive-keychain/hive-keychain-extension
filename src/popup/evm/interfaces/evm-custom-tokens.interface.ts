import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmSavedCustomTokens {
  [chainId: string]: EvmUserSavedCustomTokens;
}

export interface EvmUserSavedCustomTokens {
  [walletAddress: string]: EvmCustomToken[];
}

export interface EvmCustomErc20TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

export interface EvmCustomTokenMetadata {
  erc20?: EvmCustomErc20TokenMetadata;
}

export interface EvmCustomToken {
  address: string;
  type: EVMSmartContractType;
  metadata?: EvmCustomTokenMetadata;
}
