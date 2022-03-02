import { utils as dHiveUtils } from '@hiveio/dhive';
import {
  ClaimReward,
  Delegation,
  Transaction,
  Transfer,
} from '@interfaces/transaction.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import { store } from '@popup/store';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

const getAccountTransactions = async (
  accountName: string,
  start: number | null,
  memoKey?: string,
): Promise<Transaction[]> => {
  try {
    const op = dHiveUtils.operationOrders;
    const operationsBitmask = dHiveUtils.makeBitMaskFilter([
      op.transfer,
      op.recurrent_transfer,
      op.claim_reward_balance,
      op.delegate_vesting_shares,
    ]) as [number, number];
    store.dispatch(addToLoadingList('html_popup_downloading_transactions'));
    store.dispatch(addToLoadingList('html_popup_processing_transactions'));

    const transactionsFromBlockchain =
      await HiveUtils.getClient().database.getAccountHistory(
        accountName,
        start || -1,
        start ? Math.min(10, start) : 1000,
        operationsBitmask,
      );

    console.log(transactionsFromBlockchain);

    store.dispatch(
      removeFromLoadingList('html_popup_downloading_transactions'),
    );
    const transactions = transactionsFromBlockchain
      .map((e) => {
        let specificTransaction = null;
        switch (e[1].op[0]) {
          case 'transfer': {
            specificTransaction = e[1].op[1] as Transfer;
            const { memo } = specificTransaction;
            if (memo[0] === '#') {
              if (memoKey) {
                try {
                  const decodedMemo = HiveUtils.decodeMemo(memo, memoKey);
                  specificTransaction.memo = decodedMemo.substring(1);
                } catch (e) {
                  Logger.error('Error while decoding', '');
                }
              } else {
                specificTransaction.memo = chrome.i18n.getMessage(
                  'popup_accounts_add_memo',
                );
              }
            }
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
          case 'delegate_vesting_shares':
            {
              specificTransaction = e[1].op[1] as Delegation;
              specificTransaction.amount = `${FormatUtils.toHP(
                e[1].op[1].vesting_shares,
                store.getState().globalProperties.globals,
              ).toFixed(3)} HP`;
            }
            break;
        }
        const tr: Transaction = {
          ...specificTransaction,
          type: e[1].op[0],
          timestamp: e[1].timestamp,
          key: `${accountName}!${e[0]}`,
          index: e[0],
          txId: e[1].trx_id,
        };
        return tr;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    if (start && Math.min(1000, start) !== 1000 && transactions.length) {
      transactions[transactions.length - 1].last = true;
    }
    store.dispatch(removeFromLoadingList('html_popup_processing_transactions'));
    return transactions;
  } catch (e) {
    return getAccountTransactions(
      accountName,
      (e as any).jse_info.stack[0].data.sequence - 1,
      memoKey,
    );
  }
};

const TransactionUtils = { getAccountTransactions };

export default TransactionUtils;
