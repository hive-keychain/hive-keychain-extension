import { ActiveAccountModule } from '@background/hive/modules/active-account.module';
import BgdAccountsUtils from '@background/hive/utils/accounts.utils';
import { LocalAccount } from '@interfaces/local-account.interface';
import { LocalStorageClaimItem } from '@interfaces/local-storage-claim-item.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Asset } from 'hive-keychain-commons';
import moment from 'moment';
import Config from 'src/config';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { RewardsUtils } from 'src/popup/hive/utils/rewards.utils';
import { SavingsUtils } from 'src/popup/hive/utils/savings.utils';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { ObjectUtils } from 'src/utils/object.utils';

const start = async () => {
  if (!!process.env.STOP_AUTOLOCK) return;
  Logger.info(`Will autoclaim every ${Config.claims.FREQUENCY}mn`);
  chrome.alarms.create({ periodInMinutes: Config.claims.FREQUENCY });
  await alarmHandler();
};

const alarmHandler = async () => {
  const localStorage = await LocalStorageUtils.getMultipleValueFromLocalStorage(
    [
      LocalStorageKeyEnum.CLAIM_ACCOUNTS,
      LocalStorageKeyEnum.CLAIM_REWARDS,
      LocalStorageKeyEnum.CLAIM_SAVINGS,
    ],
  );
  const mk = await LocalStorageUtils.getValueFromSessionStorage(
    LocalStorageKeyEnum.__MK,
  );
  const claimAccounts = localStorage[LocalStorageKeyEnum.CLAIM_ACCOUNTS];
  const claimRewards = localStorage[LocalStorageKeyEnum.CLAIM_REWARDS];
  const claimSavings = localStorage[LocalStorageKeyEnum.CLAIM_SAVINGS];
  if (!mk) return;
  if (claimAccounts) {
    await initClaimAccounts(claimAccounts, mk);
  }
  if (claimRewards) {
    await initClaimRewards(claimRewards, mk);
  }
  if (claimSavings) {
    await initClaimSavings(claimSavings, mk);
  }
};

chrome.alarms.onAlarm.addListener(alarmHandler);

const initClaimRewards = async (
  claimRewards: LocalStorageClaimItem,
  mk: string,
) => {
  if (ObjectUtils.isPureObject(claimRewards)) {
    const users = Object.keys(claimRewards).filter(
      (user) => claimRewards[user] === true,
    );
    await iterateClaimRewards(users, mk);
  } else {
    Logger.error('startClaimRewards: claimRewards not defined');
  }
};

const iterateClaimRewards = async (users: string[], mk: string) => {
  const userExtendedAccounts = await AccountUtils.getExtendedAccounts(users);
  const localAccounts: LocalAccount[] =
    await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
  for (const userAccount of userExtendedAccounts) {
    const activeAccount = await ActiveAccountModule.createActiveAccount(
      userAccount,
      localAccounts,
    );
    if (
      activeAccount &&
      RewardsUtils.hasReward(
        activeAccount.account.reward_hbd_balance as string,
        activeAccount.account.reward_vesting_balance
          .toString()
          .replace('VESTS', ''),
        activeAccount.account.reward_hive_balance as string,
      )
    ) {
      Logger.info(`Claiming rewards for @${activeAccount.name}`);

      await RewardsUtils.claimRewards(
        activeAccount.name!,
        userAccount.reward_hive_balance,
        userAccount.reward_hbd_balance,
        userAccount.reward_vesting_balance,
        activeAccount.keys.posting!,
      );
    }
  }
};

const initClaimSavings = async (
  claimSavings: { [username: string]: boolean },
  mk: string,
) => {
  if (ObjectUtils.isPureObject(claimSavings)) {
    const users = Object.keys(claimSavings).filter(
      (username) => claimSavings[username] === true,
    );
    await iterateClaimSavings(users, mk);
  } else {
    Logger.error('startClaimSavings: claimSavings not defined');
  }
};

const iterateClaimSavings = async (users: string[], mk: string) => {
  const userExtendedAccounts = await AccountUtils.getExtendedAccounts(users);
  const localAccounts: LocalAccount[] =
    await BgdAccountsUtils.getAccountsFromLocalStorage(mk);

  for (const userAccount of userExtendedAccounts) {
    const activeAccount = await ActiveAccountModule.createActiveAccount(
      userAccount,
      localAccounts,
    );
    if (!activeAccount) continue;
    if (KeysUtils.isUsingLedger(activeAccount.keys.active!)) {
      Logger.warn(
        "Can't autoclaim savings because active key is saved in Ledger",
      );
      await AutomatedTasksUtils.updateClaim(
        activeAccount.name!,
        false,
        LocalStorageKeyEnum.CLAIM_SAVINGS,
      );
      continue;
    }
    let baseDate: any =
      new Date(
        activeAccount?.account.savings_hbd_last_interest_payment!,
      ).getUTCFullYear() === 1970
        ? activeAccount?.account.savings_hbd_seconds_last_update
        : activeAccount?.account.savings_hbd_last_interest_payment;

    baseDate = moment(baseDate).utcOffset('+0000', true);
    const hasSavingsToClaim =
      Number(activeAccount?.account.savings_hbd_seconds) > 0 ||
      Asset.from(activeAccount?.account.savings_hbd_balance! as Asset).amount >
        0;

    if (!hasSavingsToClaim) {
      Logger.info(
        `@${activeAccount?.name} doesn't have any savings interests to claim`,
      );
    } else {
      const canClaimSavings =
        moment(moment().utc()).diff(baseDate, 'days') >=
        Config.claims.savings.delay;
      if (canClaimSavings) {
        try {
          if (await SavingsUtils.claimSavings(activeAccount!)) {
            Logger.info(`Claim savings for @${activeAccount?.name} successful`);
          }
        } catch (err: any) {
          Logger.error('Error while claiming savings');
        }
      } else {
        Logger.info(`Not time to claim yet for @${activeAccount?.name}`);
      }
    }
  }
};

const initClaimAccounts = async (
  claimAccounts: { [x: string]: boolean },
  mk: string,
) => {
  if (ObjectUtils.isPureObject(claimAccounts)) {
    const users = Object.keys(claimAccounts).filter(
      (user) => claimAccounts[user] === true,
    );
    await iterateClaimAccounts(users, mk);
  } else {
    Logger.error('startClaimAccounts: claimAccounts not defined');
  }
};

const iterateClaimAccounts = async (users: string[], mk: string) => {
  const userExtendedAccounts = await AccountUtils.getExtendedAccounts(users);
  const localAccounts: LocalAccount[] =
    await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
  for (const userAccount of userExtendedAccounts) {
    const activeAccount = await ActiveAccountModule.createActiveAccount(
      userAccount,
      localAccounts,
    );

    if (activeAccount && KeysUtils.isUsingLedger(activeAccount?.keys.active!)) {
      Logger.warn(
        "Can't autoclaim accounts because active key is saved in Ledger",
      );
      await AutomatedTasksUtils.updateClaim(
        activeAccount?.name!,
        false,
        LocalStorageKeyEnum.CLAIM_ACCOUNTS,
      );
      continue;
    }

    if (
      activeAccount &&
      activeAccount.rc.percentage > Config.claims.freeAccount.MIN_RC_PCT
    ) {
      await AccountUtils.claimAccounts(activeAccount.rc, activeAccount);
    }
  }
};

const ClaimModule = {
  start,
};

export default ClaimModule;
