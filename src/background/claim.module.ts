import MkModule from '@background/mk.module';
import RPCModule from '@background/rpc.module';
import { ExtendedAccount } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import axios from 'axios';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

interface LocalStorageClaimItem {
  [key: string]: boolean;
}
interface LocalStorageClaim {
  claimRewards: LocalStorageClaimItem;
  claimAccounts: LocalStorageClaimItem;
}

let claimRewards: LocalStorageClaimItem = {};
let claimAccounts: LocalStorageClaimItem = {};

let claimRewardsInterval: NodeJS.Timeout;
let claimAccountsInterval: NodeJS.Timeout;

const INTERVAL = 1200 * 1000;

const updateClaims = (claims: LocalStorageClaim) => {
  claimRewards = claims.claimRewards;
  claimAccounts = claims.claimAccounts;
};

const initAutoClaim = () => {
  Logger.log('Init auto claim');
  startClaimRewards(claimRewards);
  startClaimAccounts(claimAccounts);
};

const startClaimRewards = (claimRewards: LocalStorageClaimItem) => {
  if (claimRewards) {
    if (claimRewardsInterval) clearTimeout(claimRewardsInterval);
    const users = Object.keys(claimRewards);
    iterateClaimRewards(users);
    claimRewardsInterval = setInterval(async () => {
      iterateClaimRewards(users);
    }, INTERVAL);
  } else {
    console.error('startClaimRewards: obj not defined');
  }
};

const iterateClaimAccounts = async (users: string[]) => {
  const mk = MkModule.getMk();
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
    if (activeAccount) {
      await HiveUtils.claimAccounts(rc, activeAccount);
    }
  }
};

const iterateClaimRewards = async (users: string[]) => {
  const mk = MkModule.getMk();
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
    if (claimAccountsInterval) clearTimeout(claimAccountsInterval);
    const users = Object.keys(claimAccounts);
    iterateClaimAccounts(users);
    claimAccountsInterval = setInterval(() => {
      iterateClaimAccounts(users);
    }, INTERVAL);
  } else {
    console.error('startClaimAccounts: obj not defined');
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
    console.log('error no local account');
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
  console.log(response);
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
  const res = {
    estimated_max: estimated_max,
    estimated_pct: estimated_pct.toFixed(2),
  };
  return res;
};

const ClaimModule = {
  updateClaims,
  initAutoClaim,
};

export default ClaimModule;
