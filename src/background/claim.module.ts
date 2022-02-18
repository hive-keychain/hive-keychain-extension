import RPCModule from '@background/rpc.module';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ExtendedAccount, PrivateKey } from '@hiveio/dhive/lib/index-browser';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import ImportAccountsUtils from 'src/utils/import-accounts.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const start = async () => {
  Logger.log(`Will autoclaim every ${Config.claims.FREQUENCY}mn`);
  chrome.alarms.create({ periodInMinutes: Config.claims.FREQUENCY });
  alarmHandler();
};

const alarmHandler = async () => {
  Logger.log('Alarm handler');
  const localStorage = await LocalStorageUtils.getMultipleValueFromLocalStorage(
    [
      LocalStorageKeyEnum.__MK,
      LocalStorageKeyEnum.CLAIM_ACCOUNTS,
      LocalStorageKeyEnum.CLAIM_REWARDS,
    ],
  );

  Logger.log(localStorage);
  const mk = localStorage[LocalStorageKeyEnum.__MK];
  const claimAccounts = localStorage[LocalStorageKeyEnum.CLAIM_ACCOUNTS];
  const claimRewards = localStorage[LocalStorageKeyEnum.CLAIM_REWARDS];
  if (!mk) return;
  if (claimAccounts) {
    initClaimAccounts(claimAccounts, mk);
  }
  if (claimRewards) {
  }
};

chrome.alarms.onAlarm.addListener(alarmHandler);

// const updateClaims = async (claims: LocalStorageClaim) => {
//   if (await MkModule.getMk()) {
//     // claimRewards = claims.claimRewards;
//     // claimAccounts = claims.claimAccounts;
//     initAutoClaim();
//   }
// };

// const initAutoClaim = () => {
//   Logger.log(`Will autoclaim every ${Config.claims.FREQUENCY / 60000}mn`);
//   //startClaimRewards(claimRewards);
//   startClaimAccounts();
// };

// const startClaimRewards = (claimRewards: LocalStorageClaimItem) => {
//   if (claimRewards) {
//     clearInterval(claimRewardsInterval);
//     const users = Object.keys(claimRewards).filter(
//       (user) => claimRewards[user] === true,
//     );
//     iterateClaimRewards(users);
//     claimRewardsInterval = setInterval(async () => {
//       iterateClaimRewards(users);
//     }, Config.claims.FREQUENCY);
//   } else {
//     Logger.info('startClaimRewards: obj not defined');
//   }
// };

// const iterateClaimRewards = async (users: string[]) => {
//   const mk = await MkModule.getMk();
//   if (!mk) {
//     return;
//   }
//   const userExtendedAccounts = await HiveUtils.getClient().database.getAccounts(
//     users,
//   );
//   const localAccounts: LocalAccount[] =
//     await AccountUtils.getAccountsFromLocalStorage(mk);
//   for (const userAccount of userExtendedAccounts) {
//     const activeAccount = await createActiveAccount(userAccount, localAccounts);
//     if (
//       activeAccount &&
//       ActiveAccountUtils.hasReward(
//         activeAccount.account.reward_hbd_balance as string,
//         activeAccount.account.reward_vesting_balance
//           .toString()
//           .replace('VESTS', ''),
//         activeAccount.account.reward_hive_balance as string,
//       )
//     ) {
//       Logger.log(`Claiming rewards for @${activeAccount.name}`);
//       await HiveUtils.claimRewards(
//         activeAccount,
//         userAccount.reward_hive_balance,
//         userAccount.reward_hbd_balance,
//         userAccount.reward_vesting_balance,
//       );
//     }
//   }
// };

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
  console.log(userExtendedAccounts);
  const localAccounts: LocalAccount[] =
    await ImportAccountsUtils.getAccountsFromLocalStorage(mk);
  for (const userAccount of userExtendedAccounts) {
    const activeAccount = await createActiveAccount(userAccount, localAccounts);
    console.log(activeAccount);
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
      Logger.log(`Claiming free account for @${activeAccount.name}`);
    } else Logger.log('Not enough RC% to claim account');
  } catch (err) {
    Logger.error(err);
  }
};

const ClaimModule = {
  start,
};

export default ClaimModule;
