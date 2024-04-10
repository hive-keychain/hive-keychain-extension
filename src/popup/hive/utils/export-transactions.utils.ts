import {
  Asset,
  utils as DHiveUtils,
  Operation,
  TransferOperation,
} from '@hiveio/dhive';
import TransactionUtils from '@popup/hive/utils/transaction.utils';

interface ExportTransactionOperation {
  datetime: Date;
  transactionId: string;
  blockNumber: number;
  from?: string;
  to: string;
  amount: number;
  currency: string;
  operationType: Operation;
}

const fetchTransaction = async (
  username: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ExportTransactionOperation[]> => {
  const MAX_LIMIT = 1000;
  const op = DHiveUtils.operationOrders;
  const operationsBitmask = DHiveUtils.makeBitMaskFilter([
    op.transfer,
    op.interest,
    op.transfer_to_vesting,
    op.withdraw_vesting,
    op.fill_vesting_withdraw,
    op.convert,
    op.fill_convert_request,
    op.collateralized_convert,
    op.fill_collateralized_convert_request,
    op.recurrent_transfer,
    op.fill_recurrent_transfer,
    op.fill_order,
    op.producer_reward,
    op.claim_reward_balance,
    op.escrow_release,
    op.account_create,
    op.account_create_with_delegation,
    op.proposal_pay,
    op.create_proposal,
  ]) as [number, number];

  const lastTransaction = await TransactionUtils.getLastTransaction(username);
  console.log(lastTransaction);
  let limit = Math.min();
  let start = lastTransaction;
  let transactions: any[] = [];
  let rawTransactions: any[] = [];

  let operations: ExportTransactionOperation[] = [];

  try {
    do {
      rawTransactions = await TransactionUtils.getTransactions(
        username,
        start,
        limit,
        operationsBitmask[0],
        operationsBitmask[1],
      );

      for (const tx of rawTransactions) {
        const operationPayload = tx[1].op[1];
        const operationType = tx[1].op[0];
        const transactionInfo = tx[1];
        const datetime = new Date(transactionInfo.timestamp);

        const operation: ExportTransactionOperation = {
          operationType: operationType,
          datetime: datetime,
          transactionId: transactionInfo.trx_id,
          blockNumber: transactionInfo.block,
          to: 'NA',
          amount: 0,
          currency: 'NA',
          from: 'NA',
        };

        switch (operationType) {
          case 'transfer':
          case 'recurrent_transfer':
          case 'fill_recurrent_transfer': {
            const transferOperation = operationPayload as TransferOperation[1];
            const asset = Asset.fromString(transferOperation.amount.toString());
            operations.push({
              ...operation,
              from: transferOperation.from,
              to: transferOperation.to,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'interest': {
            const asset = Asset.fromString(
              operationPayload.interest.toString(),
            );
            operations.push({
              ...operation,
              from: 'NA',
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
          }
          default:
            operations.push(operation);
        }
      }

      start = Math.min(start - 1000, rawTransactions[0][0] - 1);
    } while (start > MAX_LIMIT);
  } catch (err) {
    console.log(err);
  }
  return operations.sort((a, b) => b.datetime.getTime() - a.datetime.getTime());
};

const generateCSV = (operations: ExportTransactionOperation[]): string => {
  let csvContent = `Operation Type,Date,Transaction ID, Block number,From,To,Amount,Currency\r\n`;

  for (const operation of operations) {
    csvContent += `${operation.operationType},${operation.datetime},${
      operation.transactionId
    },${operation.blockNumber},${operation.from ?? 'NA'},${operation.to},${
      operation.amount
    },${operation.currency}\r\n`;
  }

  return csvContent;
};

const downloadTransactions = async (username: string) => {
  const operations = await fetchTransaction(username);
  const csv = generateCSV(operations);

  var data = new Blob([csv], {
    type: 'text/plain',
  });
  var url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
};

export const ExportTransactionUtils = { downloadTransactions };
