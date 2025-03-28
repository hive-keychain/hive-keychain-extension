import type { Operation } from '@hiveio/dhive';
import { ExportTransactionsUtils } from 'hive-keychain-commons';
import moment from 'moment';
import { KeychainError } from 'src/keychain-error';

const proposal_fee = 87;
const collateralized_convert_immediate_conversion = 88;

interface ExportTransactionOperation {
  datetime: string;
  transactionId: string;
  blockNumber: number;
  from?: string;
  to?: string;
  amount: number;
  currency: string;
  operationType: Operation;
}

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

const downloadTransactions = async (
  username: string,
  startDate?: Date,
  endDate?: Date,
  feedback?: (percentage: number) => void,
) => {
  const operations = await ExportTransactionsUtils.fetchTransactions(
    username,
    startDate,
    endDate,
    feedback,
  );
  console.log('operations', JSON.stringify(operations,null,2))
  if (!operations) {
    throw new KeychainError('export_transactions_fetching_error');
  }
  const csv = generateCSV(operations);
  var data = new Blob([csv], {
    type: 'text/plain',
  });
  var url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;

  a.download = `${username}-transactions-${startDate || 'start'}-${
    endDate || moment().format('YYYY-MM-DD')
  }.csv`;
  a.click();
};

export const ExportTransactionUtils = { downloadTransactions };
