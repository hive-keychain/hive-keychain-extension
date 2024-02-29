import { AutoLockType } from '@interfaces/autolock.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

export interface Settings {
  autolock?: AutoLockType;
  claimAccounts?: LocalStorageClaimItem;
  claimRewards?: LocalStorageClaimItem;
  keychainify_enabled?: boolean;
  no_confirm?: NoConfirm;
  rpc?: Rpc[];
  transfer_to?: FavoriteUserItems;
  switchRpcAuto?: boolean;
  current_rpc?: Rpc;
  [LocalStorageKeyEnum.HIDDEN_TOKENS]: string[];
  [LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG]: HiveEngineConfig;
  [LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API]: string[];
  [LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST]: string[];
}
