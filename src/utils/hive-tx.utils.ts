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
  let hiveTransaction = new HiveTransaction();
  let transaction = await hiveTransaction.create(operations);
  if (KeysUtils.isUsingLedger(key)) {
    try {
      const signedTransactionFromLedger = await LedgerUtils.signTransaction(
        transaction,
        key,
      );
      hiveTransaction.addSignature(signedTransactionFromLedger!.signatures[0]);
    } catch (err) {
      Logger.error(err);
      throw new Error('html_ledger_error_while_signing');
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
      throw new Error('html_popup_error_while_broadcasting');
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
