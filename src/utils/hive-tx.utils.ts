import KeychainApi from '@api/keychain';
import Hive from '@engrave/ledger-app-hive';
import { Operation } from '@hiveio/dhive';
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
import { AsyncUtils } from 'src/utils/async.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';

const DEFAULT_RPC = 'https://api.hive.blog';
const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000;
const HIVE_100_PERCENT = 10000;

const setRpc = async (rpc: Rpc) => {
  HiveTxConfig.node =
    rpc.uri === 'DEFAULT'
      ? (await KeychainApi.get('/hive/rpc')).data.rpc
      : rpc.uri;
  if (rpc.chainId) {
    HiveTxConfig.chain_id = rpc.chainId;
  }
};

const sendOperation = async (
  operations: Operation[],
  key: Key,
  useSignHash?: boolean,
) => {
  const transactionId = await HiveTxUtils.createSignAndBroadcastTransaction(
    operations,
    key,
    useSignHash,
  );
  if (transactionId) {
    return await HiveTxUtils.confirmTransaction(transactionId);
  } else {
    return false;
  }
};

const createTransaction = async (operations: Operation[]) => {
  let hiveTransaction = new HiveTransaction();
  return await hiveTransaction.create(operations);
};

const createSignAndBroadcastTransaction = async (
  operations: Operation[],
  key: Key,
  signHash?: boolean,
): Promise<string | undefined> => {
  let hiveTransaction = new HiveTransaction();
  let transaction = await hiveTransaction.create(operations);
  if (KeysUtils.isUsingLedger(key)) {
    try {
      let signedTransactionFromLedger;
      if (signHash) {
        const tx = await HiveTxUtils.createTransaction(operations);
        const digest = Hive.getTransactionDigest(tx);
        const signature = await LedgerUtils.signHash(
          digest,
          `48'/13'/0'/0'/0'`,
        );
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
  try {
    const response = await hiveTransaction.broadcast();
    if ((response as HiveTxBroadcastErrorResponse).error) {
      Logger.error(
        'Error during broadcast',
        (response as HiveTxBroadcastErrorResponse).error,
      );
      return;
    } else {
      return (response as HiveTxBroadcastSuccessResponse).result.tx_id;
    }
  } catch (err) {
    Logger.error(err);
    throw new Error('html_popup_error_while_broadcasting');
  }
};

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
};
