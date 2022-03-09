import { utils as dHiveUtils } from '@hiveio/dhive';
import {
  ClaimAccount,
  ClaimReward,
  Delegation,
  DepositSavings,
  FillRecurrentTransfer,
  PowerDown,
  PowerUp,
  ReceivedInterests,
  RecurrentTransfer,
  Transaction,
  Transfer,
  WithdrawSavings,
} from '@interfaces/transaction.interface';
import { store } from '@popup/store';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

export const NB_TRANSACTION_FETCHED = 1000;
export const HAS_IN_OUT_TRANSACTIONS = ['transfer', 'delegate_vesting_shares'];
export const TRANSFER_TYPE_TRANSACTIONS = [
  'transfer',
  'fill_reccurent_transfer',
  'recurrent_transfer',
];

const getSymbol = (nai: string) => {
  if (nai === '@@000000013') return 'HBD';
  if (nai === '@@000000021') return 'HIVE';
  if (nai === '@@000000037') return 'HP';
};

const getAccountTransactions = async (
  accountName: string,
  start: number,
  memoKey?: string,
): Promise<[Transaction[], number]> => {
  try {
    const op = dHiveUtils.operationOrders;
    const operationsBitmask = dHiveUtils.makeBitMaskFilter([
      op.transfer,
      op.recurrent_transfer,
      op.fill_recurrent_transfer,
      op.claim_reward_balance,
      op.delegate_vesting_shares,
      op.transfer_to_vesting,
      op.withdraw_vesting,
      op.interest,
      op.transfer_to_savings,
      op.transfer_from_savings,
      op.claim_account,
    ]) as [number, number];

    let limit = Math.min(start, NB_TRANSACTION_FETCHED);
    console.log(limit, start);
    const transactionsFromBlockchain =
      await HiveUtils.getClient().database.getAccountHistory(
        accountName,
        start,
        limit,
        operationsBitmask,
      );

    console.log();

    const transactions = transactionsFromBlockchain
      .map((e) => {
        let specificTransaction = null;
        switch (e[1].op[0]) {
          case 'transfer': {
            specificTransaction = e[1].op[1] as Transfer;
            specificTransaction = decodeMemoIfNeeded(
              specificTransaction,
              memoKey!,
            );
            break;
          }
          case 'recurrent_transfer': {
            specificTransaction = e[1].op[1] as RecurrentTransfer;
            specificTransaction = decodeMemoIfNeeded(
              specificTransaction,
              memoKey!,
            );
            break;
          }
          case 'fill_recurrent_transfer': {
            let amount = `${
              parseFloat(e[1].op[1].amount.amount) / 1000
            } ${getSymbol(e[1].op[1].amount.nai)}`;
            specificTransaction = e[1].op[1] as FillRecurrentTransfer;
            specificTransaction.amount = amount;
            specificTransaction.remainingExecutions =
              e[1].op[1].remaining_executions;
            specificTransaction = decodeMemoIfNeeded(
              specificTransaction,
              memoKey!,
            );
            break;
          }
          case 'claim_reward_balance': {
            specificTransaction = e[1].op[1] as ClaimReward;
            specificTransaction.hbd = e[1].op[1].reward_hbd;
            specificTransaction.hive = e[1].op[1].reward_hive;
            specificTransaction.hp = `${FormatUtils.toHP(
              e[1].op[1].reward_vests,
              store.getState().globalProperties.globals,
            ).toFixed(3)} HP`;
            break;
          }
          case 'delegate_vesting_shares': {
            specificTransaction = e[1].op[1] as Delegation;
            specificTransaction.amount = `${FormatUtils.toHP(
              e[1].op[1].vesting_shares,
              store.getState().globalProperties.globals,
            ).toFixed(3)} HP`;
            break;
          }
          case 'transfer_to_vesting': {
            specificTransaction = e[1].op[1] as PowerUp;
            specificTransaction.type = 'power_up_down';
            specificTransaction.subType = 'transfer_to_vesting';
            break;
          }
          case 'withdraw_vesting': {
            specificTransaction = e[1].op[1] as PowerDown;
            specificTransaction.type = 'power_up_down';
            specificTransaction.subType = 'withdraw_vesting';
            specificTransaction.amount = `${FormatUtils.toHP(
              e[1].op[1].vesting_shares,
              store.getState().globalProperties.globals,
            ).toFixed(3)} HP`;
            break;
          }
          case 'interest': {
            specificTransaction = e[1].op[1] as ReceivedInterests;
            specificTransaction.type = 'savings';
            specificTransaction.subType = 'interest';
            break;
          }
          case 'transfer_to_savings': {
            specificTransaction = e[1].op[1] as DepositSavings;
            specificTransaction.type = 'savings';
            specificTransaction.subType = 'transfer_to_savings';
            break;
          }
          case 'transfer_from_savings': {
            specificTransaction = e[1].op[1] as WithdrawSavings;
            specificTransaction.type = 'savings';
            specificTransaction.subType = 'transfer_from_savings';
            break;
          }
          case 'claim_account': {
            specificTransaction = e[1].op[1] as ClaimAccount;
            break;
          }
        }
        const tr: Transaction = {
          ...specificTransaction,
          type: specificTransaction!.type ?? e[1].op[0],
          timestamp: e[1].timestamp,
          key: `${accountName}!${e[0]}`,
          index: e[0],
          txId: e[1].trx_id,
          blockNumber: e[1].block,
          url:
            e[1].trx_id === '0000000000000000000000000000000000000000'
              ? `https://hiveblocks.com/b/${e[1].block}#${e[1].trx_id}`
              : `https://hiveblocks.com/tx/${e[1].trx_id}`,
        };
        return tr;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    if (start - NB_TRANSACTION_FETCHED < 0) {
      transactions[transactions.length - 1].last = true;
    }

    if (
      start &&
      Math.min(NB_TRANSACTION_FETCHED, start) !== NB_TRANSACTION_FETCHED &&
      transactions.length
    ) {
      transactions[transactions.length - 1].lastFetched = true;
    }
    return [transactions, start];
  } catch (e) {
    Logger.error(e, e);
    return getAccountTransactions(
      accountName,
      (e as any).jse_info.stack[0].data.sequence - 1,
      memoKey,
    );
  }
};

const getLastTransaction = async (accountName: string) => {
  const op = dHiveUtils.operationOrders;
  const allOp = Object.values(op);
  const allOperationsBitmask = dHiveUtils.makeBitMaskFilter(allOp) as [
    number,
    number,
  ];
  const transactionsFromBlockchain =
    await HiveUtils.getClient().database.getAccountHistory(
      accountName,
      -1,
      1,
      allOperationsBitmask,
    );
  return transactionsFromBlockchain.length > 0
    ? transactionsFromBlockchain[0][0]
    : -1;
};

const decodeMemoIfNeeded = (transfer: Transfer, memoKey: string) => {
  const { memo } = transfer;
  if (memo[0] === '#') {
    if (memoKey) {
      try {
        const decodedMemo = HiveUtils.decodeMemo(memo, memoKey);
        transfer.memo = decodedMemo.substring(1);
      } catch (e) {
        Logger.error('Error while decoding', '');
      }
    } else {
      transfer.memo = chrome.i18n.getMessage('popup_accounts_add_memo');
    }
  }
  return transfer;
};

const TransactionUtils = { getAccountTransactions, getLastTransaction };

export default TransactionUtils;
