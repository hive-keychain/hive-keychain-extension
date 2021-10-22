import { AutoLockType } from '@interfaces/autolock.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TransferToItems } from '@interfaces/transfer-to-username.interface';

export interface Settings {
  autolock?: AutoLockType;
  claimAccounts?: LocalStorageClaimItem;
  claimRewards?: LocalStorageClaimItem;
  keychainify_enabled?: boolean;
  no_confirm?: NoConfirm;
  rpc?: Rpc[];
  transfer_to?: TransferToItems;
}
