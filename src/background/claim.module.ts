import RPCModule from '@background/rpc.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import BgdHiveUtils from '@background/utils/hive.utils';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ExtendedAccount, PrivateKey } from '@hiveio/dhive/lib/index-browser';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const start = async () => {
  Logger.info(`Will autoclaim every ${Config.claims.FREQUENCY}mn`);
  chrome.alarms.create({ periodInMinutes: Config.claims.FREQUENCY });
  alarmHandler();
};

const alarmHandler = async () => {
  const localStorage = await LocalStorageUtils.getMultipleValueFromLocalStorage(
    [
      LocalStorageKeyEnum.__MK,
      LocalStorageKeyEnum.CLAIM_ACCOUNTS,
      LocalStorageKeyEnum.CLAIM_REWARDS,
    ],
  );

  const mk = localStorage[LocalStorageKeyEnum.__MK];
  const claimAccounts = localStorage[LocalStorageKeyEnum.CLAIM_ACCOUNTS];
  const claimRewards = localStorage[LocalStorageKeyEnum.CLAIM_REWARDS];
  if (!mk) return;
  if (claimAccounts) {
    initClaimAccounts(claimAccounts, mk);
  }
  if (claimRewards) {
    initClaimRewards(claimRewards, mk);
  }
};

chrome.alarms.onAlarm.addListener(alarmHandler);

const initClaimRewards = (claimRewards: LocalStorageClaimItem, mk: string) => {
  if (claimRewards) {
    const users = Object.keys(claimRewards).filter(
      (user) => claimRewards[user] === true,
    );
    iterateClaimRewards(users, mk);
  } else {
    Logger.info('startClaimRewards: obj not defined');
  }
};

const iterateClaimRewards = async (users: string[], mk: string) => {
  const client = await RPCModule.getClient();
  const userExtendedAccounts = await client.database.getAccounts(users);
  const localAccounts: LocalAccount[] =
    await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
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
      Logger.info(`Claiming rewards for @${activeAccount.name}`);
      await BgdHiveUtils.claimRewards(
        activeAccount,
        userAccount.reward_hive_balance,
        userAccount.reward_hbd_balance,
        userAccount.reward_vesting_balance,
      );
    }
  }
};

const initClaimAccounts = (
  claimAccounts: { [x: string]: boolean },
  mk: string,
) => {
  if (claimAccounts) {
    const users = Object.keys(claimAccounts).filter(
      (user) => claimAccounts[user] === true,
    );
    iterateClaimAccounts(users, mk);
  } else {
    Logger.error('startClaimAccounts: obj not defined', '');
  }
};

const iterateClaimAccounts = async (users: string[], mk: string) => {
  const userExtendedAccounts = await (
    await RPCModule.getClient()
  ).database.getAccounts(users);
  const localAccounts: LocalAccount[] =
    await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
  for (const userAccount of userExtendedAccounts) {
    const activeAccount = await createActiveAccount(userAccount, localAccounts);
    if (
      activeAccount &&
      activeAccount.rc.percentage > Config.claims.freeAccount.MIN_RC_PCT
    ) {
      await claimAccounts(activeAccount.rc, activeAccount);
    }
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
    rc: await getRC(localAccount.name),
  };

  return activeAccount;
};

export type AccountResourceCredits = {
  estimated_max: number;
  estimated_pct: string;
};

const getRC = async (accountName: string) => {
  const rcAcc = await (
    await RPCModule.getClient()
  ).rc.findRCAccounts([accountName]);
  const rc = await (await RPCModule.getClient()).rc.calculateRCMana(rcAcc[0]);
  return rc;
};

const claimAccounts = async (rc: Manabar, activeAccount: ActiveAccount) => {
  try {
    const freeAccountConfig = Config.claims.freeAccount;
    if (
      rc.percentage / 100 > freeAccountConfig.MIN_RC_PCT &&
      rc.max_mana > freeAccountConfig.MIN_RC
    ) {
      const client = await RPCModule.getClient();
      await client.broadcast.sendOperations(
        [
          [
            'claim_account',
            {
              creator: activeAccount.name,
              extensions: [],
              fee: '0.000 HIVE',
            },
          ],
        ],
        PrivateKey.fromString(activeAccount.keys.active as string),
      );
      Logger.info(`Claiming free account for @${activeAccount.name}`);
    } else Logger.info('Not enough RC% to claim account');
  } catch (err) {
    Logger.error(err);
  }
};

const ClaimModule = {
  start,
};

export default ClaimModule;
