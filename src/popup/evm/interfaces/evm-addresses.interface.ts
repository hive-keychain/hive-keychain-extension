import { FavoriteAddress } from '@interfaces/contacts.interface';

export enum EvmAddressType {
  SMART_CONTRACT = 'SMART_CONTRACT',
  WALLET_ADDRESS = 'WALLET_ADDRESS',
}

export interface EvmWhitelistedAddresses {
  [EvmAddressType.SMART_CONTRACT]: FavoriteAddress[];
  [EvmAddressType.WALLET_ADDRESS]: FavoriteAddress[];
}
