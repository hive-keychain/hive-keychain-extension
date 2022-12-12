import { CustomJsonOperation } from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { TransactionStatus } from '@interfaces/transaction-status.interface';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const sendOperation = async (
  operations: CustomJsonOperation[],
  key: Key,
): Promise<TransactionStatus> => {
  const transactionId = await HiveTxUtils.createSignAndBroadcastTransaction(
    operations,
    key,
    true,
  );

  if (transactionId) {
    return await HiveEngineUtils.tryConfirmTransaction(transactionId);
  } else {
    return { broadcasted: false, confirmed: false };
  }
};

const tryConfirmTransaction = (trxId: string): Promise<TransactionStatus> => {
  let result: any;
  return new Promise(async (fulfill, reject) => {
    for (let i = 0; i < 20; i++) {
      result = await HiveEngineUtils.getDelayedTransactionInfo(trxId);
      if (result != null) break;
    }

    var error = null;
    if (result && result.logs) {
      var logs = JSON.parse(result.logs);

      if (logs.errors && logs.errors.length > 0) error = logs.errors[0];
    }
    if (result != null) {
      fulfill({ broadcasted: true, confirmed: true });
    } else {
      fulfill({ broadcasted: true, confirmed: false });
    }
  });
};

const getDelayedTransactionInfo = (trxID: string) => {
  return new Promise(function (fulfill, reject) {
    setTimeout(async function () {
      fulfill(HiveEngineConfigUtils.getApi().getTransactionInfo(trxID));
    }, 1000);
  });
};

export const HiveEngineUtils = {
  getDelayedTransactionInfo,
  tryConfirmTransaction,
  sendOperation,
};
