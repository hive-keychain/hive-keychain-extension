import { Asset, ClaimRewardBalanceOperation } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import FormatUtils from 'src/utils/format.utils';

const claimRewards = async (
  username: string,
  rewardHive: string | Asset,
  rewardHBD: string | Asset,
  rewardVests: string | Asset,
  postingKey: string,
  options?: TransactionOptions,
): Promise<TransactionResult | null> => {
  return await HiveTxUtils.sendOperation(
    [
      [
        'claim_reward_balance',
        {
          account: username,
          reward_hive: rewardHive,
          reward_hbd: rewardHBD,
          reward_vests: rewardVests,
        },
      ] as ClaimRewardBalanceOperation,
    ],
    postingKey,
    false,
    options,
  );
};

const hasReward = (
  reward_hbd: string,
  reward_hp: string,
  reward_hive: string,
): boolean => {
  return (
    FormatUtils.getValFromString(reward_hbd) !== 0 ||
    FormatUtils.getValFromString(reward_hp) !== 0 ||
    FormatUtils.getValFromString(reward_hive) !== 0
  );
};

const getAvailableRewards = (activeAccount: ActiveAccount) => {
  let reward_hbd = activeAccount.account.reward_hbd_balance;
  let reward_vests = activeAccount.account.reward_vesting_balance;
  const reward_hp = FormatUtils.toHP(reward_vests as string) + ' HP';
  let reward_hive = activeAccount.account.reward_hive_balance;
  let rewardText = chrome.i18n.getMessage('popup_account_redeem') + ':<br>';
  if (FormatUtils.getValFromString(reward_hp) != 0)
    rewardText += reward_hp + ' / ';
  if (FormatUtils.getValFromString(reward_hbd as string) != 0)
    rewardText += reward_hbd + ' / ';
  if (FormatUtils.getValFromString(reward_hive as string) != 0)
    rewardText += reward_hive + ' / ';
  rewardText = rewardText.slice(0, -3);
  return [reward_hbd, reward_hp, reward_hive, rewardText];
};

export const RewardsUtils = {
  claimRewards,
  hasReward,
  getAvailableRewards,
};
