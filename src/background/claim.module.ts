import MkModule from '@background/mk.module';
import RPCModule from '@background/rpc.module';
import { ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import {
  LocalStorageClaim,
  LocalStorageClaimItem,
} from '@interfaces/local-storage-claim-item.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import axios from 'axios';
import Config from 'src/config';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

let claimRewards: LocalStorageClaimItem = {};
let claimAccounts: LocalStorageClaimItem = {};

let claimRewardsInterval: NodeJS.Timeout;
let claimAccountsInterval: NodeJS.Timeout;

const updateClaims = async (claims: LocalStorageClaim) => {
  if (await MkModule.getMk()) {
    claimRewards = claims.claimRewards;
    claimAccounts = claims.claimAccounts;
    initAutoClaim();
  }
};

const loadClaims = async () => {
  const claims = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
  ]);

  updateClaims(claims);
};

const initAutoClaim = () => {
  Logger.log(`Will autoclaim every ${Config.claims.FREQUENCY / 60000}mn`);
  startClaimRewards(claimRewards);
  startClaimAccounts(claimAccounts);
};

const startClaimRewards = (claimRewards: LocalStorageClaimItem) => {
  if (claimRewards) {
    clearInterval(claimRewardsInterval);
    const users = Object.keys(claimRewards).filter(
      (user) => claimRewards[user] === true,
    );
    iterateClaimRewards(users);
    claimRewardsInterval = setInterval(async () => {
      iterateClaimRewards(users);
    }, Config.claims.FREQUENCY);
  } else {
    Logger.info('startClaimRewards: obj not defined');
  }
};

const iterateClaimAccounts = async (users: string[]) => {
  const mk = await MkModule.getMk();
  if (!mk) {
    return;
  }
  const userExtendedAccounts = await HiveUtils.getClient().database.getAccounts(
    users,
  );
  const localAccounts: LocalAccount[] =
    await AccountUtils.getAccountsFromLocalStorage(mk);
  for (const userAccount of userExtendedAccounts) {
    const rc = await getRC(userAccount.name);
    const activeAccount = await createActiveAccount(userAccount, localAccounts);
    if (
      activeAccount &&
      parseFloat(rc.estimated_pct) > Config.claims.freeAccount.MIN_RC_PCT
    ) {
      await HiveUtils.claimAccounts(rc, activeAccount);
    }
  }
};

const iterateClaimRewards = async (users: string[]) => {
  const mk = await MkModule.getMk();
  if (!mk) {
    return;
  }
  const userExtendedAccounts = await HiveUtils.getClient().database.getAccounts(
    users,
  );
  const localAccounts: LocalAccount[] =
    await AccountUtils.getAccountsFromLocalStorage(mk);
  for (const userAccount of userExtendedAccounts) {
    const activeAccount = await createActiveAccount(userAccount, localAccounts);
    if (
      activeAccount &&
      ActiveAccountUtils.hasReward(
        activeAccount.account.reward_hbd_balance as string,
        activeAccount.account.reward_vesting_balance
          .toString()
          .replace('VESTS', ''),
        activeAccount.account.reward_hive_balance as string,
      )
    ) {
      Logger.log(`Claiming rewards for @${activeAccount.name}`);
      await HiveUtils.claimRewards(
        activeAccount,
        userAccount.reward_hive_balance,
        userAccount.reward_hbd_balance,
        userAccount.reward_vesting_balance,
      );
    }
  }
};

const startClaimAccounts = (claimAccounts: LocalStorageClaimItem) => {
  if (claimAccounts) {
    clearInterval(claimAccountsInterval);
    const users = Object.keys(claimAccounts).filter(
      (user) => claimAccounts[user] === true,
    );
    iterateClaimAccounts(users);
    claimAccountsInterval = setInterval(() => {
      iterateClaimAccounts(users);
    }, Config.claims.FREQUENCY);
  } else {
    Logger.error('startClaimAccounts: obj not defined', '');
  }
};

const createActiveAccount = async (
  userAccount: ExtendedAccount,
  localAccounts: LocalAccount[],
) => {
  const localAccount = localAccounts.find(
    (localAccount) => localAccount.name === userAccount.name,
  );
  if (!localAccount) {
    return;
  }
  const activeAccount: ActiveAccount = {
    account: userAccount,
    keys: localAccount.keys,
    name: localAccount.name,
    rc: await HiveUtils.getRC(localAccount.name),
  };

  return activeAccount;
};

export type AccountResourceCredits = {
  estimated_max: number;
  estimated_pct: string;
};

const getRC = async (username: string) => {
  let data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'rc_api.find_rc_accounts',
    params: {
      accounts: [username],
    },
  };
  let url = RPCModule.getActiveRpc().uri;
  if (url === 'DEFAULT') url = 'https://api.hive.blog/';
  const response = (await axios.post(url, JSON.stringify(data))).data;
  const STEEM_RC_MANA_REGENERATION_SECONDS = 432000;
  const estimated_max = parseFloat(response.result.rc_accounts['0'].max_rc);
  const current_mana = parseFloat(
    response.result.rc_accounts['0'].rc_manabar.current_mana,
  );
  const last_update_time = parseFloat(
    response.result.rc_accounts['0'].rc_manabar.last_update_time,
  );
  const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
  let estimated_mana =
    current_mana +
    (diff_in_seconds * estimated_max) / STEEM_RC_MANA_REGENERATION_SECONDS;
  if (estimated_mana > estimated_max) estimated_mana = estimated_max;

  const estimated_pct = (estimated_mana / estimated_max) * 100;
  const res: AccountResourceCredits = {
    estimated_max: estimated_max,
    estimated_pct: estimated_pct.toFixed(2),
  };
  return res;
};

const ClaimModule = {
  updateClaims,
  loadClaims,
};

export default ClaimModule;
