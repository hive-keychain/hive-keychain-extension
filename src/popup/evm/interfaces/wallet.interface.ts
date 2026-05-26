import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { HDNodeWallet, Wallet } from 'ethers';

export type EvmWallet = HDNodeWallet | Wallet;

export type WalletWithBalance = {
  wallet: HDNodeWallet;
  balance: number;
  selected: boolean;
};
export type StoredSeed = {
  seed: string;
  id: number;
  nickname?: string;
  accounts: StoredEvmWalletAddress[];
};
export type StoredEvmWalletAddress = {
  id: number;
  path: string;
  order?: number;
  hide?: boolean;
  nickname?: string;
};

export type EvmAccount = StoredEvmWalletAddress & {
  wallet: EvmWallet;
  seedId: number;
  seedNickname?: string;
};

/** Dialog IPC / UI row: same metadata as EvmAccount but no signing material. */
export type EvmAccountPublic = StoredEvmWalletAddress & {
  address: string;
  seedId: number;
  seedNickname?: string;
};

export type EvmAccountOrPublic = EvmAccount | EvmAccountPublic;

export interface SavedAddresses {
  [address: string]: EvmAddressType;
}
