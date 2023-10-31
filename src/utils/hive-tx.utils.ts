import { KeychainApi } from '@api/keychain';
import Hive from '@engrave/ledger-app-hive';
import { Operation, Transaction } from '@hiveio/dhive';
import {
  HiveTxBroadcastErrorResponse,
  HiveTxBroadcastResult,
  HiveTxBroadcastSuccessResponse,
  TransactionResult,
} from '@interfaces/hive-tx.interface';
import { Key } from '@interfaces/keys.interface';
import { Rpc } from '@interfaces/rpc.interface';
import {
  Transaction as HiveTransaction,
  config as HiveTxConfig,
  PrivateKey,
  call,
} from 'hive-tx';
import Config from 'src/config';
import { KeychainError } from 'src/keychain-error';
import { AsyncUtils } from 'src/utils/async.utils';
import { ErrorUtils } from 'src/utils/error.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';

const MINUTE = 60;

const setRpc = async (rpc: Rpc) => {
  HiveTxConfig.node =
    rpc.uri === 'DEFAULT' ? (await KeychainApi.get('hive/rpc')).rpc : rpc.uri;
  if (rpc.chainId) {
    HiveTxConfig.chain_id = rpc.chainId;
  }
};
const sendOperation = async (
  operations: Operation[],
  key: Key,
  confirmation?: boolean,
): Promise<TransactionResult | null> => {
  const transactionResult = await HiveTxUtils.createSignAndBroadcastTransaction(
    operations,
    key,
  );
  if (transactionResult) {
    return {
      id: transactionResult.tx_id,
      tx_id: transactionResult.tx_id,
      confirmed: confirmation
        ? await confirmTransaction(transactionResult.tx_id)
        : false,
    } as TransactionResult;
  } else {
    return null;
  }
};

const createTransaction = async (operations: Operation[]) => {
  let hiveTransaction = new HiveTransaction();
  const tx = await hiveTransaction.create(
    operations,
    Config.transactions.expirationTimeInMinutes * MINUTE,
  );
  Logger.log(`length of transaction => ${JSON.stringify(tx).length}`);
  return tx;
};

const createSignAndBroadcastTransaction = async (
  operations: Operation[],
  key: Key,
): Promise<HiveTxBroadcastResult | undefined> => {
  let hiveTransaction = new HiveTransaction();
  let transaction = await hiveTransaction.create(
    operations,
    Config.transactions.expirationTimeInMinutes * MINUTE,
  );

  if (KeysUtils.isUsingLedger(key)) {
    let hashSignPolicy;
    try {
      hashSignPolicy = (await LedgerUtils.getSettings()).hashSignPolicy;
    } catch (err: any) {
      throw ErrorUtils.parseLedger(err);
    }
    if (!Hive.isDisplayableOnDevice(transaction) && !hashSignPolicy) {
      throw new KeychainError('error_ledger_no_hash_sign_policy');
    }
    try {
      let signedTransactionFromLedger;
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
      throw err;
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
      const result = (response as HiveTxBroadcastSuccessResponse).result;
      return {
        ...result,
      };
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
  const MAX_RETRY_COUNT = 6;
  let retryCount = 0;
  do {
    response = await call('transaction_status_api.find_transaction', {
      transaction_id: transactionId,
    });
    await AsyncUtils.sleep(1000);
    retryCount++;
  } while (
    ['within_mempool', 'unknown'].includes(response.result.status) &&
    retryCount < MAX_RETRY_COUNT
  );
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

const signTransaction = async (tx: Transaction, key: Key) => {
  const hiveTransaction = new HiveTransaction(tx);
  if (KeysUtils.isUsingLedger(key)) {
    let hashSignPolicy;
    try {
      hashSignPolicy = (await LedgerUtils.getSettings()).hashSignPolicy;
    } catch (err: any) {
      throw ErrorUtils.parseLedger(err);
    }

    if (!Hive.isDisplayableOnDevice(tx) && !hashSignPolicy) {
      throw new KeychainError('error_ledger_no_hash_sign_policy');
    }

    try {
      if (!Hive.isDisplayableOnDevice(tx)) {
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
  confirmation?: boolean,
): Promise<TransactionResult | undefined> => {
  let hiveTransaction = new HiveTransaction(transaction);
  hiveTransaction.addSignature(signature);
  let response;
  try {
    Logger.log(hiveTransaction);
    response = await hiveTransaction.broadcast();
    if ((response as HiveTxBroadcastSuccessResponse).result) {
      const transactionResult: HiveTxBroadcastResult = (
        response as HiveTxBroadcastSuccessResponse
      ).result;
      return {
        id: transactionResult.tx_id,
        tx_id: transactionResult.tx_id,
        confirmed: confirmation
          ? await confirmTransaction(transactionResult.tx_id)
          : false,
      } as TransactionResult;
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
  } else {
    if (window) {
      import('src/utils/rpc-switcher.utils').then(({ useWorkingRPC }) => {
        useWorkingRPC();
      });
    }
    throw new Error(
      `Error while retrieving data from ${method} : ${JSON.stringify(
        response.error,
      )}`,
    );
  }
};

export const HiveTxUtils = {
  sendOperation,
  createSignAndBroadcastTransaction,
  // confirmTransaction,
  getData,
  setRpc,
  createTransaction,
  signTransaction,
  broadcastAndConfirmTransactionWithSignature,
};
