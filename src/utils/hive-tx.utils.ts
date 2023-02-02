import KeychainApi from '@api/keychain';
import Hive from '@engrave/ledger-app-hive';
import { Operation, Transaction } from '@hiveio/dhive';
import {
  HiveTxBroadcastErrorResponse,
  HiveTxBroadcastSuccessResponse,
} from '@interfaces/hive-tx.interface';
import { Key } from '@interfaces/keys.interface';
import { Rpc } from '@interfaces/rpc.interface';
import {
  call,
  config as HiveTxConfig,
  PrivateKey,
  Transaction as HiveTransaction,
} from 'hive-tx';
import { KeychainError } from 'src/keychain-error';
import { AsyncUtils } from 'src/utils/async.utils';
import { ErrorUtils } from 'src/utils/error.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';

const setRpc = async (rpc: Rpc) => {
  HiveTxConfig.node =
    rpc.uri === 'DEFAULT'
      ? (await KeychainApi.get('/hive/rpc')).data.rpc
      : rpc.uri;
  if (rpc.chainId) {
    HiveTxConfig.chain_id = rpc.chainId;
  }
};

const sendOperation = async (operations: Operation[], key: Key) => {
  const transactionId = await HiveTxUtils.createSignAndBroadcastTransaction(
    operations,
    key,
  );
  if (transactionId) {
    return await HiveTxUtils.confirmTransaction(transactionId);
  } else {
    return false;
  }
};

const createTransaction = async (operations: Operation[]) => {
  let hiveTransaction = new HiveTransaction();
  const tx = await hiveTransaction.create(operations);
  Logger.log(`length of transaction => ${JSON.stringify(tx).length}`);
  return tx;
};

const createSignAndBroadcastTransaction = async (
  operations: Operation[],
  key: Key,
): Promise<string | undefined> => {
  let hiveTransaction = new HiveTransaction();
  let transaction = await hiveTransaction.create(operations);
  if (KeysUtils.isUsingLedger(key)) {
    let hashSignPolicy;
    try {
      hashSignPolicy = (await LedgerUtils.getSettings()).hashSignPolicy;
    } catch (err: any) {
      throw ErrorUtils.parse(err);
    }

    if (!Hive.isDisplayableOnDevice(transaction) && !hashSignPolicy) {
      throw new KeychainError('error_ledger_no_hash_sign_policy');
    }
    try {
      let signedTransactionFromLedger;
      console.log(
        'TRANSACTION SIZE ' + JSON.stringify(transaction).length,
        !Hive.isDisplayableOnDevice(transaction),
      );
      if (!Hive.isDisplayableOnDevice(transaction)) {
        const digest = Hive.getTransactionDigest(transaction);
        const signature = await LedgerUtils.signHash(digest, key);
        hiveTransaction.addSignature(signature);
      } else {
        signedTransactionFromLedger = await LedgerUtils.signTransaction(
          transaction,
          key,
        );
        hiveTransaction.addSignature(
          signedTransactionFromLedger!.signatures[0],
        );
      }
    } catch (err) {
      Logger.error(err);
      throw ErrorUtils.parse(err);
    }
  } else {
    try {
      const privateKey = PrivateKey.fromString(key!.toString());
      hiveTransaction.sign(privateKey);
    } catch (err) {
      Logger.error(err);
      throw new Error('html_popup_error_while_signing_transaction');
    }
  }
  let response;
  try {
    response = await hiveTransaction.broadcast();
    if ((response as HiveTxBroadcastSuccessResponse).result) {
      return (response as HiveTxBroadcastSuccessResponse).result.tx_id;
    }
  } catch (err) {
    Logger.error(err);
    throw new Error('html_popup_error_while_broadcasting');
  }
  response = response as HiveTxBroadcastErrorResponse;
  if (response.error) {
    Logger.error('Error during broadcast', response.error);
    throw ErrorUtils.parse(response.error);
  }
};
/* istanbul ignore next */
const confirmTransaction = async (transactionId: string) => {
  let response = null;
  do {
    response = await call('transaction_status_api.find_transaction', {
      transaction_id: transactionId,
    });
    await AsyncUtils.sleep(500);
  } while (['within_mempool', 'unknown'].includes(response.result.status));
  if (
    ['within_reversible_block', 'within_irreversible_block'].includes(
      response.result.status,
    )
  ) {
    Logger.info('Transaction confirmed');
    return true;
  } else {
    Logger.error(`Transaction failed with status: ${response.result.status}`);
    return false;
  }
};

const signTransaction = async (tx: any, key: Key, signHash?: boolean) => {
  const hiveTransaction = new HiveTransaction(tx);
  if (KeysUtils.isUsingLedger(key)) {
    let hashSignPolicy;
    try {
      hashSignPolicy = (await LedgerUtils.getSettings()).hashSignPolicy;
    } catch (err: any) {
      throw ErrorUtils.parse(err);
    }

    if (signHash || (!Hive.isDisplayableOnDevice(tx) && !hashSignPolicy)) {
      throw new KeychainError('error_ledger_no_hash_sign_policy');
    }

    try {
      if (signHash || !Hive.isDisplayableOnDevice(tx)) {
        const digest = Hive.getTransactionDigest(tx);
        const signature = await LedgerUtils.signHash(digest, key);
        hiveTransaction.addSignature(signature);
      } else {
        return await LedgerUtils.signTransaction(tx, key);
      }
    } catch (err) {
      Logger.error(err);
      throw err;
    }
  } else {
    try {
      const privateKey = PrivateKey.fromString(key!.toString());
      return hiveTransaction.sign(privateKey);
    } catch (err) {
      Logger.error(err);
      throw new KeychainError('html_popup_error_while_signing_transaction');
    }
  }
};

const broadcastAndConfirmTransactionWithSignature = async (
  transaction: Transaction,
  signature: string,
) => {
  let hiveTransaction = new HiveTransaction(transaction);
  hiveTransaction.addSignature(signature);
  let response;
  try {
    response = await hiveTransaction.broadcast();
    if ((response as HiveTxBroadcastSuccessResponse).result) {
      const txId = (response as HiveTxBroadcastSuccessResponse).result.tx_id;
      return HiveTxUtils.confirmTransaction(txId);
    }
  } catch (err) {
    Logger.error(err);
    throw new Error('html_popup_error_while_broadcasting');
  }
  response = response as HiveTxBroadcastErrorResponse;
  if (response.error) {
    Logger.error('Error during broadcast', response.error);
    throw ErrorUtils.parse(response.error);
  }
};
/* istanbul ignore next */
const getData = async (
  method: string,
  params: any[] | object,
  key?: string,
) => {
  const response = await call(method, params);
  if (response?.result) {
    return key ? response.result[key] : response.result;
  } else
    throw new Error(
      `Error while retrieving data from ${method} : ${JSON.stringify(
        response.error,
      )}`,
    );
};

export const HiveTxUtils = {
  sendOperation,
  createSignAndBroadcastTransaction,
  confirmTransaction,
  getData,
  setRpc,
  createTransaction,
  signTransaction,
  broadcastAndConfirmTransactionWithSignature,
};
