import type { ExtendedAccount } from '@hiveio/dhive';
import type { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Keys } from '@interfaces/keys.interface';
import { RcDelegationsInfo } from '@interfaces/rc-delegation.interface';
export type RC = Manabar & RcDelegationsInfo;

export interface ActiveAccount {
  account: ExtendedAccount;
  keys: Keys;
  rc: RC;
  name?: string;
}
