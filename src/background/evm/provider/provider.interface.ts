export interface RequestArguments {
  id?: string;
  method: string;
  params?: unknown[] | object;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

export interface EvmConnectedWallets {
  [domain: string]: string[];
}
