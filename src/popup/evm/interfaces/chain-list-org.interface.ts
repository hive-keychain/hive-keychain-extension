/** Single RPC entry from [chainlist.org/rpcs.json](https://chainlist.org/rpcs.json) */
export interface ChainListOrgRpcEntry {
  url: string;
  tracking?: string;
  isOpenSource?: boolean;
}

/** Chain record from the ChainList.org RPCs JSON. Extra fields are preserved at runtime. */
export interface ChainListOrgChain {
  name: string;
  chain: string;
  icon?: string;
  rpc: ChainListOrgRpcEntry[];
  features?: { name: string }[];
  faucets: unknown[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
  shortName: string;
  chainId: number;
  networkId: number;
  slip44?: number;
  ens?: { registry: string };
  explorers?: {
    name: string;
    url: string;
    standard?: string;
    icon?: string;
  }[];
  tvl?: number;
  chainSlug?: string;
  isTestnet?: boolean;
}
