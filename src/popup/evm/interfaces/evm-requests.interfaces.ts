export interface AddChainRequest {
  chainName: string;
  chainId: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}
