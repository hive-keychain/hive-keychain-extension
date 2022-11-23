import KeychainApi from '@api/keychain';
import { Operation } from '@hiveio/dhive';
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

interface HiveTxBroadcastSuccessResponse {
  id: number;
  jsonrpc: string;
  result: { tx_id: string; status: string };
}

interface HiveTxBroadcastErrorResponse {
  error: object;
}

const DEFAULT_RPC = 'https://api.hive.blog';
const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000;
const HIVE_100_PERCENT = 10000;

const setRpc = async (rpc: Rpc) => {
  HiveTxConfig.node =
    rpc.uri === 'DEFAULT'
      ? (await KeychainApi.get('/hive/rpc')).data.rpc
      : rpc.uri;
  HiveTxConfig.chain_id = rpc.chainId ?? '';
};

const sendOperation = async (operations: Operation[], key: Key) => {
  const transactionId = await HiveTxUtils.createSignAndBroadcastTransaction(
    operations,
    key,
  );
  return await HiveTxUtils.confirmTransaction(transactionId);
};

const createSignAndBroadcastTransaction = async (
  operations: Operation[],
  key: Key,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let tx = new HiveTransaction();
    tx.create(operations).then((transaction) => {
      console.log(transaction);
      try {
        if (KeysUtils.isUsingLedger(key)) {
          tx = new HiveTransaction(
            LedgerUtils.signTransaction(transaction, key),
          );
        } else {
          const privateKey = PrivateKey.fromString(key!.toString());
          tx.sign(privateKey);
        }
      } catch (err) {
        console.log(err);
        reject('html_popup_error_while_signing_transaction');
        return;
      }
      try {
        tx.broadcast().then((response) => {
          if ((response as HiveTxBroadcastErrorResponse).error) {
            reject('html_popup_error_while_broadcasting');
          } else {
            resolve((response as HiveTxBroadcastSuccessResponse).result.tx_id);
          }
        });
      } catch (err) {
        console.log(err);
        reject('html_popup_error_while_broadcasting');
      }
    });
  });
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
    Logger.info(`Transaction failed with status: ${response.result.status}`);
    return false;
  }
};

export const HiveTxUtils = {
  sendOperation,
  createSignAndBroadcastTransaction,
  confirmTransaction,
};

// When ready will replace HiveTx
