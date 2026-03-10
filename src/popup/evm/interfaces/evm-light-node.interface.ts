export interface EvmLightNodeRegisteredAddresses {
  [chainId: string]: string[];
}

export type EvmLightNodeContractMetadataBase = {
  address: string;
  name: string | null;
  symbol: string | null;
};

export type EvmLightNodeContractTokenMetadata = EvmLightNodeContractMetadataBase & {
  decimals: number | null;
  logoUrl: string | null;
  coingeckoId: string | null;
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
  chainId: number; // DB chain id
  address: string;
  firstSeenBlock: number;
  lastSeenBlock: number | null;
  abi: any | null;
  contractType: string | null;
  verified: boolean | null;
  isProxy: boolean;
  proxyTarget: string | null;
  possibleSpam: boolean | null;
  metadata: EvmLightNodeContractMetadata | null;
  price: EvmLightNodeContractPrice | null;
}
