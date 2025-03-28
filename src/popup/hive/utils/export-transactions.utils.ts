import type { Operation } from '@hiveio/dhive';
import { ExportTransactionsUtils } from 'hive-keychain-commons';
import moment from 'moment';
import { KeychainError } from 'src/keychain-error';


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
  if (!operations) {
    throw new KeychainError('export_transactions_fetching_error');
  }
  const csv = ExportTransactionsUtils.generateCSV(operations);
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
