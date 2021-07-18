import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Keys } from 'src/interfaces/local-account.interface';

export interface ActiveAccount {
  account: ExtendedAccount;
  keys: Keys;
  rc: Manabar;
  name?: string;
}
