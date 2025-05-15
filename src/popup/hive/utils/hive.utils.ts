import type { ExtendedAccount, Price } from '@hiveio/dhive';
import * as hive from '@hiveio/hive-js';
import { Asset } from 'hive-keychain-commons';
import {
  GlobalProperties,
  RewardFund,
} from 'src/interfaces/global-properties.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
const signature = require('@hiveio/hive-js/lib/auth/ecc');

const DEFAULT_RPC = 'https://api.hive.blog';
const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000;
const HIVE_100_PERCENT = 10000;

const getAccountPrice = async () => {
  const price = await HiveTxUtils.getData(
    'condenser_api.get_chain_properties',
    [],
  );
  return Asset.fromString(price.account_creation_fee.toString()).amount;
};

const getVP = (account: ExtendedAccount) => {
  if (!account.name) {
    return null;
  }
  const estimated_max =
    (getEffectiveVestingSharesPerAccount(account) -
      parseFloat(account.vesting_withdraw_rate as string)) *
    1000000;
  const current_mana = parseFloat(
    account.voting_manabar.current_mana as string,
  );
  const last_update_time = account.voting_manabar.last_update_time;
  const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
  let estimated_mana =
    current_mana +
    (diff_in_seconds * estimated_max) / HIVE_VOTING_MANA_REGENERATION_SECONDS;
  if (estimated_mana > estimated_max) {
    estimated_mana = estimated_max;
  }
  const estimated_pct = (estimated_mana / estimated_max) * 100;
  return estimated_pct;
};
/* istanbul ignore next */
const getEffectiveVestingSharesPerAccount = (account: ExtendedAccount) => {
  const effective_vesting_shares =
    parseFloat((account.vesting_shares as string).replace(' VESTS', '')) +
    parseFloat(
      (account.received_vesting_shares as string).replace(' VESTS', ''),
    ) -
    parseFloat(
      (account.delegated_vesting_shares as string).replace(' VESTS', ''),
    );
  return effective_vesting_shares;
};

const getVotingDollarsPerAccount = (
  voteWeight: number,
  properties: GlobalProperties,
  account: ExtendedAccount,
  full: boolean,
) => {
  if (!properties.globals || !account.name) {
    return null;
  }
  const vp = getVP(account)! * 100;
  const rewardBalance = HiveUtils.getRewardBalance(properties);
  const recentClaims = HiveUtils.getRecentClaims(properties);
  const hivePrice = HiveUtils.getHivePrice(properties);
  const votePowerReserveRate = HiveUtils.getVotePowerReserveRate(properties);

  if (rewardBalance && recentClaims && hivePrice && votePowerReserveRate) {
    const effective_vesting_shares = Math.round(
      getEffectiveVestingSharesPerAccount(account) * 1000000,
    );
    const current_power = full ? 10000 : vp;
    const weight = voteWeight * 100;

    const max_vote_denom =
      (votePowerReserveRate * HIVE_VOTING_MANA_REGENERATION_SECONDS) /
      (60 * 60 * 24);
    let used_power = Math.round((current_power * weight) / HIVE_100_PERCENT);
    used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
    const rshares = Math.round(
      (effective_vesting_shares * used_power) / HIVE_100_PERCENT,
    );
    const voteValue = ((rshares * rewardBalance) / recentClaims) * hivePrice;
    return isNaN(voteValue) ? '0' : voteValue.toFixed(2);
  } else {
    return;
  }
};
/* istanbul ignore next */
const getRewardBalance = (properties: GlobalProperties) => {
  return parseFloat(properties.rewardFund!.reward_balance);
};
/* istanbul ignore next */
const getRecentClaims = (properties: GlobalProperties) => {
  return parseInt(properties.rewardFund!.recent_claims, 10);
};
/* istanbul ignore next */
const getHivePrice = (properties: GlobalProperties) => {
  return (
    parseFloat(properties.price!.base + '') /
    parseFloat(properties.price!.quote + '')
  );
};
/* istanbul ignore next */
const getVotePowerReserveRate = (properties: GlobalProperties) => {
  return properties.globals!.vote_power_reserve_rate;
};

const getTimeBeforeFull = (votingPower: number) => {
  let remainingPowerToGet = 100.0 - votingPower;

  // 1% every 72minutes
  let minutesNeeded = remainingPowerToGet * 72;
  if (minutesNeeded === 0) {
    return chrome.i18n.getMessage('popup_utils_full');
  } else {
    let fullInDays = parseInt((minutesNeeded / 1440).toString());
    let fullInHours = parseInt(
      ((minutesNeeded - fullInDays * 1440) / 60).toString(),
    );
    let fullInMinutes = parseInt(
      (minutesNeeded - fullInDays * 1440 - fullInHours * 60).toString(),
    );
    const fullIn = [];

    if (fullInDays) {
      fullIn.push(
        fullInDays +
          (fullInDays > 1
            ? ` ${chrome.i18n.getMessage('days')}`
            : ` ${chrome.i18n.getMessage('day')}`),
      );
    }
    if (fullInHours) {
      fullIn.push(
        fullInHours +
          (fullInHours > 1
            ? ` ${chrome.i18n.getMessage('hours')}`
            : ` ${chrome.i18n.getMessage('hour')}`),
      );
    }
    if (fullInMinutes) {
      fullIn.push(
        fullInMinutes +
          (fullInMinutes > 1
            ? ` ${chrome.i18n.getMessage('minutes')}`
            : ` ${chrome.i18n.getMessage('minute')}`),
      );
    }

    let fullInString = fullIn.join(` ${chrome.i18n.getMessage('common_and')} `);

    if (fullIn.length === 3) {
      fullInString = fullInString.replace(
        ` ${chrome.i18n.getMessage('common_and')} `,
        ', ',
      );
    }

    return chrome.i18n.getMessage('full_in', [fullInString]);
  }
};

/* istanbul ignore next */
const encodeMemo = (
  memo: string,
  privateKey: string,
  receiverPublicKey: string,
) => {
  if (KeysUtils.isUsingLedger(privateKey))
    throw new KeychainError('encode_with_memo_key_in_ledger');
  return hive.memo.encode(privateKey, receiverPublicKey, memo);
};
/* istanbul ignore next */
const decodeMemo = (memo: string, privateKey: string) => {
  if (KeysUtils.isUsingLedger(privateKey))
    throw new KeychainError('decode_with_memo_key_in_ledger');
  return hive.memo.decode(privateKey, memo);
};

const signMessage = (message: string, privateKey: string) => {
  let buf;
  try {
    const o = JSON.parse(message, (k, v) => {
      if (
        v !== null &&
        typeof v === 'object' &&
        'type' in v &&
        v.type === 'Buffer' &&
        'data' in v &&
        Array.isArray(v.data)
      ) {
        return Buffer.from(v.data);
      }
      return v;
    });
    if (Buffer.isBuffer(o)) {
      buf = o;
    } else {
      buf = message;
    }
  } catch (e) {
    buf = message;
  }
  return signature.Signature.signBuffer(buf, privateKey).toHex();
};

const getCurrentMedianHistoryPrice = async (): Promise<Price> => {
  return HiveTxUtils.getData(
    'condenser_api.get_current_median_history_price',
    [],
  );
};
const getRewardFund = async (): Promise<RewardFund> => {
  return HiveTxUtils.getData('condenser_api.get_reward_fund', ['post']);
};

const isLayer1Token = (token: string) => {
  return ['HIVE', 'HBD'].includes(token);
};

const HiveUtils = {
  getVP,
  getVotingDollarsPerAccount,
  getTimeBeforeFull,
  encodeMemo,
  decodeMemo,
  signMessage,
  getRewardBalance,
  getRecentClaims,
  getHivePrice,
  getVotePowerReserveRate,
  getAccountPrice,
  getCurrentMedianHistoryPrice,
  getRewardFund,
  isLayer1Token,
};

export default HiveUtils;
