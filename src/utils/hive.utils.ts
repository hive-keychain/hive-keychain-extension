import KeychainApi from '@api/keychain';
import {
  Asset,
  ClaimRewardBalanceOperation,
  Client,
  CollateralizedConvertOperation,
  DynamicGlobalProperties,
  ExtendedAccount,
  Price,
  PrivateKey,
  RecurrentTransferOperation,
  TransactionConfirmation,
  TransferFromSavingsOperation,
  TransferToSavingsOperation,
  TransferToVestingOperation,
  UpdateProposalVotesOperation,
  WithdrawVestingOperation,
} from '@hiveio/dhive';
import { sleep } from '@hiveio/dhive/lib/utils';
import * as hive from '@hiveio/hive-js';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { ConversionType } from '@popup/pages/app-container/home/conversion/conversion-type.enum';
import { store } from '@popup/store';
import Config from 'src/config';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { CollateralizedConversion } from 'src/interfaces/collaterelized-conversion.interface';
import { Conversion } from 'src/interfaces/conversion.interface';
import { Delegator } from 'src/interfaces/delegations.interface';
import {
  GlobalProperties,
  RewardFund,
} from 'src/interfaces/global-properties.interface';
import { Rpc } from 'src/interfaces/rpc.interface';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';
const signature = require('@hiveio/hive-js/lib/auth/ecc');

const DEFAULT_RPC = 'https://api.hive.blog';
const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000;
const HIVE_100_PERCENT = 10000;

let client = new Client(DEFAULT_RPC);

const getClient = (): Client => {
  return client;
};
const setRpc = async (rpc: Rpc) => {
  console.log('Is the error before this line?');
  client = new Client(
    rpc.uri === 'DEFAULT'
      ? (await KeychainApi.get('/hive/rpc')).data.rpc
      : rpc.uri,
  );
  console.log('And after this line?');
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
const getRC = async (accountName: string) => {
  const rcAcc = await getClient().rc.findRCAccounts([accountName]);
  const rc = await getClient().rc.calculateRCMana(rcAcc[0]);
  return rc;
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

export const getConversionRequests = async (name: string) => {
  const [hbdConversions, hiveConversions] = await Promise.all([
    getClient().database.call('get_conversion_requests', [name]),
    getClient().database.call('get_collateralized_conversion_requests', [name]),
  ]);

  return [
    ...hiveConversions.map((e: CollateralizedConversion) => ({
      amount: e.collateral_amount,
      conversion_date: e.conversion_date,
      id: e.id,
      owner: e.owner,
      requestid: e.requestid,
      collaterized: true,
    })),
    ...hbdConversions,
  ].sort(
    (a, b) =>
      new Date(a.conversion_date).getTime() -
      new Date(b.conversion_date).getTime(),
  );
};

export const getDelegators = async (name: string) => {
  return (
    (await KeychainApi.get(`/hive/delegators/${name}`)).data as Delegator[]
  )
    .filter((e) => e.vesting_shares !== 0)
    .sort((a, b) => b.vesting_shares - a.vesting_shares);
};

export const getDelegatees = async (name: string) => {
  return (await getClient().database.getVestingDelegations(name, '', 1000))
    .filter((e) => parseFloat(e.vesting_shares + '') !== 0)
    .sort(
      (a, b) =>
        parseFloat(b.vesting_shares + '') - parseFloat(a.vesting_shares + ''),
    );
};

const claimRewards = async (
  activeAccount: ActiveAccount,
  rewardHive: string | Asset,
  rewardHBD: string | Asset,
  rewardVests: string | Asset,
): Promise<boolean> => {
  try {
    await HiveUtils.sendOperationWithConfirmation(
      HiveUtils.getClient().broadcast.sendOperations(
        [
          [
            'claim_reward_balance',
            {
              account: activeAccount.name,
              reward_hive: rewardHive,
              reward_hbd: rewardHBD,
              reward_vests: rewardVests,
            },
          ] as ClaimRewardBalanceOperation,
        ],
        PrivateKey.fromString(activeAccount.keys.posting as string),
      ),
    );
    const rewardHp =
      FormatUtils.withCommas(
        FormatUtils.toHP(
          rewardVests.toString().replace('VESTS', ''),
          store.getState().globalProperties.globals,
        ).toString(),
      ) + ' HP';
    let claimedResources = [rewardHBD, rewardHive, rewardHp].filter(
      (resource) => parseFloat(resource.toString().split(' ')[0]) !== 0,
    );

    store.dispatch(
      setSuccessMessage('popup_html_claim_success', [
        claimedResources.join(', '),
      ]),
    );
    return true;
  } catch (err: any) {
    Logger.error('Error while claiming rewards', err.toString());
    store.dispatch(setErrorMessage('popup_html_claim_error'));
    return false;
  }
};

const powerUp = async (from: string, to: string, amount: string) => {
  try {
    await HiveUtils.sendOperationWithConfirmation(
      HiveUtils.getClient().broadcast.sendOperations(
        [
          [
            'transfer_to_vesting',
            {
              from: from,
              to: to,
              amount: amount,
            },
          ] as TransferToVestingOperation,
        ],
        PrivateKey.fromString(
          store.getState().activeAccount.keys.active as string,
        ),
      ),
    );
    return true;
  } catch (err) {
    return false;
  }
};

const powerDown = async (username: string, amount: string) => {
  try {
    await HiveUtils.sendOperationWithConfirmation(
      HiveUtils.getClient().broadcast.sendOperations(
        [
          [
            'withdraw_vesting',
            {
              account: username,
              vesting_shares: amount,
            },
          ] as WithdrawVestingOperation,
        ],
        PrivateKey.fromString(
          store.getState().activeAccount.keys.active as string,
        ),
      ),
    );
    return true;
  } catch (err) {
    return false;
  }
};

const transfer = async (
  sender: string,
  receiver: string,
  amount: string,
  memo: string,
  recurrent: boolean,
  iterations: number,
  frequency: number,
) => {
  try {
    if (!recurrent) {
      await sendOperationWithConfirmation(
        getClient().broadcast.transfer(
          {
            from: sender,
            to: receiver,
            amount: amount,
            memo: memo,
          },
          PrivateKey.fromString(
            store.getState().activeAccount.keys.active as string,
          ),
        ),
      );
    } else {
      await sendOperationWithConfirmation(
        getClient().broadcast.sendOperations(
          [
            [
              'recurrent_transfer',
              {
                from: sender,
                to: receiver,
                amount: amount,
                memo: memo,
                recurrence: frequency,
                executions: iterations,
                extensions: [],
              },
            ] as RecurrentTransferOperation,
          ],
          PrivateKey.fromString(
            store.getState().activeAccount.keys.active as string,
          ),
        ),
      );
    }
    return true;
  } catch (err) {
    Logger.error(err, err);
    return false;
  }
};
/* istanbul ignore next */
const convertOperation = async (
  activeAccount: ActiveAccount,
  conversions: Conversion[],
  amount: string,
  conversionType: ConversionType,
) => {
  const requestid = Math.max(...conversions.map((e) => e.requestid), 0) + 1;
  try {
    await sendOperationWithConfirmation(
      getClient().broadcast.sendOperations(
        [
          [
            conversionType,
            {
              owner: activeAccount.name,
              requestid: requestid,
              amount: amount,
            },
          ] as CollateralizedConvertOperation,
        ],
        PrivateKey.fromString(
          store.getState().activeAccount.keys.active as string,
        ),
      ),
    );
    return true;
  } catch (err) {
    Logger.error(err);
    return false;
  }
};
/* istanbul ignore next */
const encodeMemo = (
  memo: string,
  privateKey: string,
  receiverPublicKey: string,
) => {
  return hive.memo.encode(privateKey, receiverPublicKey, memo);
};
/* istanbul ignore next */
const decodeMemo = (memo: string, privateKey: string) => {
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
/* istanbul ignore next */
const deposit = async (
  activeAccount: ActiveAccount,
  amount: string,
  receiver: string,
) => {
  const savings = await hive.api.getSavingsWithdrawFromAsync(
    activeAccount.name,
  );
  const requestId = Math.max(...savings.map((e: any) => e.request_id), 0) + 1;
  try {
    await sendOperationWithConfirmation(
      getClient().broadcast.sendOperations(
        [
          [
            'transfer_to_savings',
            {
              amount: amount,
              from: activeAccount.name,
              memo: '',
              request_id: requestId,
              to: receiver,
            },
          ] as TransferToSavingsOperation,
        ],
        PrivateKey.fromString(
          store.getState().activeAccount.keys.active as string,
        ),
      ),
    );
    return true;
  } catch (err) {
    return false;
  }
};
/* istanbul ignore next */
const withdraw = async (
  activeAccount: ActiveAccount,
  amount: string,
  to: string,
) => {
  const savings = await hive.api.getSavingsWithdrawFromAsync(
    activeAccount.name,
  );
  const requestId = Math.max(...savings.map((e: any) => e.request_id), 0) + 1;

  try {
    await sendOperationWithConfirmation(
      getClient().broadcast.sendOperations(
        [
          [
            'transfer_from_savings',
            {
              amount: amount,
              from: activeAccount.name,
              memo: '',
              request_id: requestId,
              to,
            },
          ] as TransferFromSavingsOperation,
        ],
        PrivateKey.fromString(
          store.getState().activeAccount.keys.active as string,
        ),
      ),
    );
    return true;
  } catch (err) {
    return false;
  }
};
/* istanbul ignore next */
const delegateVestingShares = async (
  activeAccount: ActiveAccount,
  delegatee: string,
  vestingShares: string,
) => {
  try {
    await sendOperationWithConfirmation(
      getClient().broadcast.delegateVestingShares(
        {
          delegatee: delegatee,
          delegator: activeAccount.name!,
          vesting_shares: vestingShares,
        },
        PrivateKey.fromString(
          store.getState().activeAccount.keys.active as string,
        ),
      ),
    );

    return true;
  } catch (err) {
    Logger.error(err);
    return false;
  }
};
/* istanbul ignore next */
const sendCustomJson = async (json: any, activeAccount: ActiveAccount) => {
  return await sendOperationWithConfirmation(
    getClient().broadcast.json(
      {
        id: Config.hiveEngine.mainnet,
        required_auths: [activeAccount.name!],
        required_posting_auths: activeAccount.keys.active
          ? []
          : [activeAccount.name!],
        json: JSON.stringify(json),
      },
      PrivateKey.fromString(activeAccount.keys.active as string),
    ),
  );
};
/* istanbul ignore next */
const voteForProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  try {
    await updateProposalVote(activeAccount, proposalId, true);
    return true;
  } catch (err) {
    Logger.error(err, err);
    return false;
  }
};
/* istanbul ignore next */
const unvoteProposal = async (
  activeAccount: ActiveAccount,
  proposalId: number,
) => {
  try {
    await updateProposalVote(activeAccount, proposalId, false);
    return true;
  } catch (err) {
    Logger.error(err, err);
    return false;
  }
};
/* istanbul ignore next */
const updateProposalVote = async (
  activeAccount: ActiveAccount,
  proposalId: number,
  vote: boolean,
) => {
  return await sendOperationWithConfirmation(
    getClient().broadcast.sendOperations(
      [
        [
          'update_proposal_votes',
          {
            voter: activeAccount.name!,
            proposal_ids: [proposalId],
            approve: vote,
            extensions: [],
          },
        ] as UpdateProposalVotesOperation,
      ],
      PrivateKey.fromString(
        store.getState().activeAccount.keys.active as string,
      ),
    ),
  );
};

const sendOperationWithConfirmation = async (
  transactionConfirmationPromise: Promise<TransactionConfirmation>,
) => {
  const transactionConfirmation = await transactionConfirmationPromise;
  let transaction = null;
  do {
    transaction = await HiveUtils.getClient().transaction.findTransaction(
      transactionConfirmation.id,
    );
    await sleep(500);
  } while (['within_mempool', 'unknown'].includes(transaction.status));
  if (transaction.status === 'within_reversible_block') {
    Logger.info('Transaction confirmed');
    return transactionConfirmation.id || true;
  } else {
    Logger.info(`Transaction failed with status: ${transaction.status}`);
    return;
  }
};

/* istanbul ignore next */
const getDelayedTransactionInfo = (trxID: string) => {
  return new Promise(function (fulfill, reject) {
    setTimeout(async function () {
      fulfill(await getClient().transaction.findTransaction(trxID));
    }, 500);
  });
};
/* istanbul ignore next */
const getProposalDailyBudget = async () => {
  return (
    parseFloat(
      (await getClient().database.getAccounts(['hive.fund']))[0].hbd_balance
        .toString()
        .split(' ')[0],
    ) / 100
  );
};
/**
 * getClient().database.getDynamicGlobalProperties()
 */
const getDynamicGlobalProperties =
  async (): Promise<DynamicGlobalProperties> => {
    return getClient().database.getDynamicGlobalProperties();
  };
/**
 * getClient().database.getCurrentMedianHistoryPrice()
 */
const getCurrentMedianHistoryPrice = async (): Promise<Price> => {
  return getClient().database.getCurrentMedianHistoryPrice();
};
/**
 * getClient().database.call(method, params).
 * Fixed params: method 'get_reward_fund', params ['post]
 */
const getRewardFund = async (): Promise<RewardFund> => {
  return getClient().database.call('get_reward_fund', ['post']);
};

const HiveUtils = {
  getClient,
  setRpc,
  getVP,
  getRC,
  getVotingDollarsPerAccount,
  getTimeBeforeFull,
  getConversionRequests,
  claimRewards,
  powerUp,
  powerDown,
  transfer,
  encodeMemo,
  decodeMemo,
  convertOperation,
  withdraw,
  deposit,
  delegateVestingShares,
  sendCustomJson,
  signMessage,
  voteForProposal,
  getDelayedTransactionInfo,
  sendOperationWithConfirmation,
  unvoteProposal,
  getProposalDailyBudget,
  getRewardBalance,
  getRecentClaims,
  getHivePrice,
  getVotePowerReserveRate,
  getDynamicGlobalProperties,
  getCurrentMedianHistoryPrice,
  getRewardFund,
  getDelegatees,
};

export default HiveUtils;
