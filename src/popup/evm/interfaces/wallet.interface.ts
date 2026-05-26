import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { HDNodeWallet } from 'ethers';

export enum EvmAccountSource {
  SEED = 'seed',
  LEDGER = 'ledger',
}

export type EvmLedgerWallet = {
  address: string;
  path: string;
  index: number;
  source: EvmAccountSource.LEDGER;
};

export type EvmWallet = HDNodeWallet | EvmLedgerWallet;

export type WalletWithBalance = {
  wallet: HDNodeWallet;
  balance: number;
  selected: boolean;
};
export type StoredSeed = {
  type?: EvmAccountSource.SEED;
  seed: string;
  id: number;
  nickname?: string;
  accounts: StoredEvmWalletAddress[];
};
export type StoredEvmWalletAddress = {
  id: number;
  path: string;
  address?: string;
  order?: number;
  hide?: boolean;
  nickname?: string;
};

export type StoredEvmLedgerAccount = StoredEvmWalletAddress & {
  address: string;
};

export type StoredEvmLedgerWalletSource = {
  type: EvmAccountSource.LEDGER;
  id: number;
  nickname?: string;
  accounts: StoredEvmLedgerAccount[];
};

export type StoredEvmAccountSource = StoredSeed | StoredEvmLedgerWalletSource;

export type EvmAccount = StoredEvmWalletAddress & {
  wallet: EvmWallet;
  seedId: number;
  seedNickname?: string;
  source: EvmAccountSource;
};

/** Dialog IPC / UI row: same metadata as EvmAccount but no signing material. */
export type EvmAccountPublic = StoredEvmWalletAddress & {
  address: string;
  seedId: number;
  seedNickname?: string;
  source: EvmAccountSource;
};

export type EvmAccountOrPublic = EvmAccount | EvmAccountPublic;

export interface SavedAddresses {
  [address: string]: EvmAddressType;
}
