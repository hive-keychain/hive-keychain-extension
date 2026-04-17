import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmSavedCustomTokens {
  [chainId: string]: EvmUserSavedCustomTokens;
}

export interface EvmUserSavedCustomTokens {
  [walletAddress: string]: EvmCustomToken[];
}

/** ERC20 fields without discriminant; used for builders and legacy migration */
export interface EvmCustomErc20TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

/** Stored custom token metadata: discriminated by contract type */
export interface EvmCustomTokenMetadataErc20 extends EvmCustomErc20TokenMetadata {
  type: EVMSmartContractType.ERC20;
}

export type EvmCustomTokenMetadata = EvmCustomTokenMetadataErc20;

export interface EvmCustomToken {
  address: string;
  type: EVMSmartContractType;
  metadata?: EvmCustomTokenMetadata;
}
