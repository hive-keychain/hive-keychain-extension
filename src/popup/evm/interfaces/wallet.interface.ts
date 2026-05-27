import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { HDNodeWallet, Wallet } from 'ethers';

export enum EvmAccountSource {
  SEED = 'seed',
  LEDGER = 'ledger',
  IMPORTED = 'imported',
}

export enum EvmLedgerDerivationMode {
  BIP44 = 'bip44',
  LEDGER_LIVE = 'ledger_live',
  LEGACY = 'legacy',
}

export type EvmLedgerWallet = {
  address: string;
  path: string;
  index: number;
  derivationMode?: EvmLedgerDerivationMode;
  source: EvmAccountSource.LEDGER;
};

export type EvmImportedWallet = Wallet;

export type EvmWallet = HDNodeWallet | EvmLedgerWallet | EvmImportedWallet;

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
  derivationMode?: EvmLedgerDerivationMode;
  ledgerIndex?: number;
};

export type StoredEvmLedgerWalletSource = {
  type: EvmAccountSource.LEDGER;
  id: number;
  nickname?: string;
  accounts: StoredEvmLedgerAccount[];
};

export type StoredEvmImportedAccount = StoredEvmWalletAddress & {
  address: string;
  privateKey: string;
};

export type StoredEvmImportedWalletSource = {
  type: EvmAccountSource.IMPORTED;
  id: number;
  nickname?: string;
  accounts: StoredEvmImportedAccount[];
};

export type StoredEvmAccountSource =
  | StoredSeed
  | StoredEvmLedgerWalletSource
  | StoredEvmImportedWalletSource;

export type EvmAccount = StoredEvmWalletAddress & {
  wallet: EvmWallet;
  seedId: number;
  seedNickname?: string;
  derivationMode?: EvmLedgerDerivationMode;
  source: EvmAccountSource;
};

/** Dialog IPC / UI row: same metadata as EvmAccount but no signing material. */
export type EvmAccountPublic = StoredEvmWalletAddress & {
  address: string;
  seedId: number;
  seedNickname?: string;
  derivationMode?: EvmLedgerDerivationMode;
  source: EvmAccountSource;
};

export type EvmAccountOrPublic = EvmAccount | EvmAccountPublic;

export interface SavedAddresses {
  [address: string]: EvmAddressType;
}
