import { TransactionConfirmation } from '@hiveio/dhive';
import { TransactionResult } from '@interfaces/hive-tx.interface';

export default {
  trx: {
    id: '12',
    block_num: 12234,
    trx_num: 12234,
    expired: false,
  } as TransactionConfirmation,
};

//TODO all bellow maybe move them to its own file: "tx-confirmation"
//TODO check bellow if used || remove
export const transactionConfirmationSuccess = {
  confirmed: true,
  status: 'ok',
  tx_id: '45dfd45ds54ds65f4sd5',
};

export const hiveTxConfirmation = (
  tx_id: string,
  id: string,
  confirmed?: boolean,
) => {
  return { tx_id, id, confirmed } as TransactionResult;
};

export const transactionConfirmationFailed = {
  confirmed: false,
  status: 'nok',
  tx_id: 'jfidslji39fds93489fjd9',
};
