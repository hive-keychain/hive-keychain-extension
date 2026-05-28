export interface EvmLightNodeRegisteredAddresses {
  [chainId: string]: string[];
}

export type EvmLightNodeSecurityCheck = {
  isMalicious: boolean;
  reasons: string[];
  stale: boolean;
};

export type EvmLightNodeContractMetadataBase = {
  address: string;
  name: string | null;
  symbol: string | null;
};

export type EvmLightNodeContractTokenMetadata = EvmLightNodeContractMetadataBase & {
  decimals: number | null;
  logoUrl: string | null;
  coingeckoId: string | null;
  backgroundColor?: string;
};

export type EvmLightNodeContractNftMetadata = EvmLightNodeContractMetadataBase & {
  decimals?: never;
  logoUrl?: never;
  coingeckoId?: never;
};

export type EvmLightNodeContractMetadata =
  | EvmLightNodeContractTokenMetadata
  | EvmLightNodeContractNftMetadata;

export type EvmLightNodeContractPrice = {
  priceUsd: number;
  fetchedAt: string; // ISO
};

export interface EvmLightNodeContractResponse {
  id: number;
  /** DB chain id in response body; path uses EVM chain id */
  chainId: number;
  address: string;
  firstSeenBlock: number;
  lastSeenBlock: number | null;
  abi: any | null;
  contractType: string | null;
  verified: boolean | null;
  isProxy: boolean;
  proxyTargetAddress?: string | null;
  /** Normalized implementation address string */
  proxyTarget: string | null;
  possibleSpam: boolean | null;
  metadata: EvmLightNodeContractMetadata | null;
  price: EvmLightNodeContractPrice | null;
  security?: EvmLightNodeSecurityCheck;
}
