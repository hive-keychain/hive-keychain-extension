import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { RcDelegationsInfo } from '@interfaces/rc-delegation.interface';
import { Keys } from 'src/interfaces/local-account.interface';
export type RC = Manabar & RcDelegationsInfo;

export interface ActiveAccount {
  account: ExtendedAccount;
  keys: Keys;
  rc: RC;
  name?: string;
}
