import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';

export interface EvmSavedCustomTokens {
  [chainId: string]: EvmUserSavedCustomTokens;
}

export interface EvmUserSavedCustomTokens {
  [walletAddress: string]: EvmCustomToken[];
}

export interface EvmSavedCustomNfts {
  [chainId: string]: EvmUserSavedCustomNfts;
}

export interface EvmUserSavedCustomNfts {
  [walletAddress: string]: EvmCustomNft[];
}

/** ERC20 fields without discriminant; used for builders and legacy migration */
export interface EvmCustomErc20TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  coingeckoId?: string;
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

export interface EvmCustomNft {
  address: string;
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155;
  tokenIds: string[];
  /** Optional label shown in the wallet instead of the contract name when set. */
  collectionName?: string;
}
