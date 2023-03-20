import { TransactionConfirmation } from '@hiveio/dhive';

export default {
  trx: {
    id: '12',
    block_num: 12234,
    trx_num: 12234,
    expired: false,
  } as TransactionConfirmation,
};

export const transactionConfirmationSuccess = {
  confirmed: true,
  status: 'ok',
  tx_id: '45dfd45ds54ds65f4sd5',
};

export const transactionConfirmationFailed = {
  confirmed: false,
  status: 'nok',
  tx_id: 'jfidslji39fds93489fjd9',
};
