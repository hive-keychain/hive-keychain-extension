import { AutoLockType } from '@interfaces/autolock.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';

export interface Settings {
  autolock?: AutoLockType;
  claimAccounts?: LocalStorageClaimItem;
  claimRewards?: LocalStorageClaimItem;
  keychainify_enabled?: boolean;
  no_confirm?: NoConfirm;
  rpc?: Rpc[];
  transfer_to?: FavoriteUserItems;
  switchRpcAuto?: boolean;
}
