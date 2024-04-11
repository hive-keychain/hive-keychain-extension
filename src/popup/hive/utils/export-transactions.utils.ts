import {
  Asset,
  utils as DHiveUtils,
  Operation,
  TransferOperation,
} from '@hiveio/dhive';
import TransactionUtils from '@popup/hive/utils/transaction.utils';
import moment from 'moment';
import { KeychainError } from 'src/keychain-error';
import Logger from 'src/utils/logger.utils';

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

const fetchTransaction = async (
  username: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ExportTransactionOperation[] | undefined> => {
  const MAX_LIMIT = 1000;
  const op = DHiveUtils.operationOrders;
  const operationsBitmask = DHiveUtils.makeBitMaskFilter([
    op.transfer,
    op.interest,
    op.transfer_to_vesting,
    op.fill_vesting_withdraw,
    op.fill_convert_request,
    op.fill_collateralized_convert_request,
    collateralized_convert_immediate_conversion,
    op.fill_recurrent_transfer,
    op.fill_order,
    op.producer_reward,
    op.claim_reward_balance,
    op.escrow_release,
    op.account_create,
    op.account_create_with_delegation,
    op.proposal_pay,
    op.escrow_approve,
    proposal_fee,
  ]) as [number, number];
  const lastTransaction = await TransactionUtils.getLastTransaction(username);

  let limit = Math.min();
  let start = lastTransaction;
  let rawTransactions: any[] = [];

  let operations: ExportTransactionOperation[] = [];
  let forceStop = false;
  try {
    do {
      rawTransactions = await TransactionUtils.getTransactions(
        username,
        start,
        limit,
        operationsBitmask[0],
        operationsBitmask[1],
      );

      for (let i = rawTransactions.length - 1; i >= 0; i--) {
        const tx = rawTransactions[i];
        const operationPayload = tx[1].op[1];
        const operationType = tx[1].op[0];
        const transactionInfo = tx[1];
        const localDatetime = moment(transactionInfo.timestamp + 'z').format(
          'yyyy-MM-DD hh:mm:ss',
        );
        const date = moment.utc(transactionInfo.timestamp);

        if (endDate && date.isSameOrAfter(moment(endDate).add(1, 'day'), 'day'))
          continue;

        if (startDate && date.isBefore(moment(startDate), 'day')) {
          forceStop = true;
          break;
        }

        const operation: ExportTransactionOperation = {
          operationType: operationType,
          datetime: localDatetime,
          transactionId: transactionInfo.trx_id,
          blockNumber: transactionInfo.block,
          to: 'NA',
          amount: 0,
          currency: 'NA',
          from: 'NA',
        };

        switch (operationType) {
          case 'transfer':
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
            break;
          }
          case 'transfer_to_vesting': {
            const asset = Asset.fromString(operationPayload.amount.toString());
            operations.push({
              ...operation,
              from: operationPayload.from,
              to: operationPayload.to,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'fill_vesting_withdraw': {
            const asset = Asset.fromString(
              operationPayload.deposited.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.from_account,
              to: operationPayload.to_account,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }

          case 'fill_convert_request': {
            let asset = Asset.fromString(
              operationPayload.amount_out.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            asset = Asset.fromString(operationPayload.amount_in.toString());
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'collateralized_convert_immediate_conversion': {
            let asset = Asset.fromString(operationPayload.hbd_out.toString());
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }

          case 'fill_collateralized_convert_request': {
            let asset = Asset.fromString(
              operationPayload.amount_out.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            asset = Asset.fromString(operationPayload.amount_in.toString());
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            asset = Asset.fromString(
              operationPayload.excess_collateral.toString(),
            );
            operations.push({
              ...operation,
              from: operationPayload.owner,
              to: operationPayload.owner,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }

          case 'producer_reward': {
            let asset = Asset.fromString(
              operationPayload.vesting_shares.toString(),
            );
            operations.push({
              ...operation,
              to: operationPayload.producer,
              amount: asset.amount,
              currency: asset.symbol,
            });
            break;
          }
          case 'claim_reward_balance': {
            let asset = Asset.fromString(
              operationPayload.reward_hive.toString(),
            );
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.account,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.reward_hbd.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.account,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.reward_vests.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.account,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'escrow_release': {
            let asset = Asset.fromString(
              operationPayload.hbd_amount.toString(),
            );
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.to,
                from: operationPayload.from,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.hive_amount.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.to,
                from: operationPayload.from,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'account_create':
          case 'account_create_with_delegation': {
            let asset = Asset.fromString(operationPayload.fee.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                from: operationPayload.creator,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'proposal_pay': {
            let asset = Asset.fromString(operationPayload.payment.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.receiver,
                from: operationPayload.payer,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'fill_order': {
            let asset = Asset.fromString(
              operationPayload.current_pays.toString(),
            );
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.open_owner,
                from: operationPayload.current_owner,
                amount: asset.amount,
                currency: asset.symbol,
              });
            asset = Asset.fromString(operationPayload.open_pays.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.current_owner,
                from: operationPayload.open_owner,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          case 'proposal_fee': {
            let asset = Asset.fromString(operationPayload.fee.toString());
            if (asset.amount > 0)
              operations.push({
                ...operation,
                to: operationPayload.treasury,
                from: operationPayload.creator,
                amount: asset.amount,
                currency: asset.symbol,
              });
            break;
          }
          default:
            Logger.log(`missing ${operationType}`);
            break;
        }
      }

      console.log(operations);

      start = Math.min(start - 1000, rawTransactions[0][0] - 1);
    } while (start > MAX_LIMIT && !forceStop);
    return operations;
  } catch (err) {
    Logger.error('Error while fetching transactions', err);
  }
  return undefined;
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

const downloadTransactions = async (
  username: string,
  startDate?: Date,
  endDate?: Date,
) => {
  const operations = await fetchTransaction(username, startDate, endDate);
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
  a.download = 'transactions.csv';
  a.click();
};

export const ExportTransactionUtils = { downloadTransactions };
