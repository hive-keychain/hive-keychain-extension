import { utils as dHiveUtils } from '@hiveio/dhive';
import { Transaction, Transfer } from '@interfaces/transaction.interface';
import HiveUtils from 'src/utils/hive.utils';

const getAccountTransactions = async (
  accountName: string,
  start: number | null,
  memoKey?: string,
): Promise<Transaction[]> => {
  try {
    const op = dHiveUtils.operationOrders;
    const operationsBitmask = dHiveUtils.makeBitMaskFilter([op.transfer]) as [
      number,
      number,
    ];
    const transactions = await HiveUtils.getClient().database.getAccountHistory(
      accountName,
      start || -1,
      start ? Math.min(10, start) : 1000,
      operationsBitmask,
    );

    const transfers = transactions
      .filter((e) => e[1].op[0] === 'transfer')
      .map((e) => {
        const receivedTransaction = e[1].op[1] as Transfer;
        const tr: Transaction = {
          ...receivedTransaction,
          type: 'transfer',
          timestamp: e[1].timestamp,
          key: `${accountName}!${e[0]}`,
        };
        return tr;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    if (start && Math.min(1000, start) !== 1000 && transfers.length) {
      transfers[transfers.length - 1].last = true;
    }
    const trs = [];
    for (const transfer of transfers) {
      const { memo } = transfer;
      if (memo[0] === '#') {
        if (memoKey) {
          try {
            transfer.memo = HiveUtils.decodeMemo(memoKey, memo);
          } catch (e) {}
        } else {
          transfer.memo = chrome.i18n.getMessage('wallet.add_memo');
        }
        trs.push(transfer);
      } else {
        trs.push(transfer);
      }
    }
    return trs;
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
