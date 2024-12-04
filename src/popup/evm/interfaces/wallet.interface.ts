import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { HDNodeWallet } from 'ethers';

export type WalletWithBalance = {
  wallet: HDNodeWallet;
  balance: number;
  selected: boolean;
};
export type StoredEvmAccounts = {
  seed: string;
  id: number;
  nickname?: string;
  accounts: StoredEvmAccount[];
};
export type StoredEvmAccount = {
  id: number;
  path: string;
  hide?: boolean;
  nickname?: string;
};

export type EvmAccount = StoredEvmAccount & {
  wallet: HDNodeWallet;
  seedId: number;
  seedNickname?: string;
};

export interface SavedAddresses {
  [address: string]: EvmAddressType;
}
