export enum EvmAddressType {
  SMART_CONTRACT = 'SMART_CONTRACT',
  WALLET_ADDRESS = 'WALLET_ADDRESS',
}

export interface EvmFavoriteAddress {
  address: string;
  label?: string;
}

export interface EvmWhitelistedAddresses {
  [EvmAddressType.SMART_CONTRACT]: EvmFavoriteAddress[];
  [EvmAddressType.WALLET_ADDRESS]: EvmFavoriteAddress[];
}
