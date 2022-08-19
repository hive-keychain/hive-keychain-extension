import { Asset } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ActiveAccount } from '@interfaces/active-account.interface';

export interface ClaimRewardsParams {
  activeAccount: ActiveAccount;
  rewardHive: string | Asset;
  rewardHBD: string | Asset;
  rewardVests: string | Asset;
}

export interface ClaimAccountsParams {
  rc: Manabar;
  activeAccount: ActiveAccount;
}
