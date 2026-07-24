import { LocalAccount } from '@interfaces/local-account.interface';
import { StoredEvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

export type ExportedSettings = Partial<
  Record<LocalStorageKeyEnum, unknown>
>;

export interface ExportedAccountsV2 {
  v: 2;
  hiveAccounts: LocalAccount[];
  evmAccounts: StoredEvmAccountSource[];
  settings?: ExportedSettings;
}
