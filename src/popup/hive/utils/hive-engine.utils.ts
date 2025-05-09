import type { CustomJsonOperation } from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { TokenTransaction } from '@interfaces/tokens.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainError } from 'src/keychain-error';
import { ErrorUtils } from 'src/popup/hive/utils/error.utils';
import { HiveEngineConfigUtils } from 'src/popup/hive/utils/hive-engine-config.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { TokenRequestParams } from 'src/popup/hive/utils/token-request-params.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const sendOperation = async (
  operations: CustomJsonOperation[],
  key: Key,
  options?: TransactionOptions,
): Promise<HiveEngineTransactionStatus> => {
  const transactionResult = await HiveTxUtils.createSignAndBroadcastTransaction(
    operations,
    key,
    options,
  );

  if (transactionResult) {
    if (transactionResult.isUsingMultisig) {
      return {
        tx_id: transactionResult.tx_id,
        broadcasted: false,
        confirmed: false,
        isUsingMultisig: true,
      };
    } else {
      return await HiveEngineUtils.tryConfirmTransaction(
        transactionResult.tx_id,
      );
    }
  } else {
    return {
      broadcasted: false,
      confirmed: false,
      tx_id: '',
    };
  }
};

const tryConfirmTransaction = (
  trxId: string,
): Promise<HiveEngineTransactionStatus> => {
  let result: any;
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < 20; i++) {
      let res: any = await HiveEngineUtils.getDelayedTransactionInfo(trxId);
      result = res.result;
      if (result !== null) break;
    }

    var error = null;
    if (result && result.logs) {
      var logs = JSON.parse(result.logs);

      if (logs.errors && logs.errors.length > 0) {
        error = logs.errors[0];
        reject(ErrorUtils.parseHiveEngine(error, JSON.parse(result.payload)));
      }
    }
    if (result != null) {
      resolve({ broadcasted: true, confirmed: true, tx_id: trxId });
    } else {
      resolve({ broadcasted: true, confirmed: false, tx_id: trxId });
    }
  });
};

/* istanbul ignore next */
const getDelayedTransactionInfo = (trxID: string) => {
  return new Promise(function (fulfill, reject) {
    setTimeout(async function () {
      const url = `${HiveEngineConfigUtils.getApi()}/blockchain`;
      let resolved = false;
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'getTransactionInfo',
          params: {
            txid: trxID,
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (res && res.status === 200) {
            resolved = true;
            return res.json();
          }
        })
        .then((res: any) => fulfill(res));

      setTimeout(() => {
        if (!resolved) {
          reject(new KeychainError('html_popup_tokens_timeout'));
        }
      }, 20 * 1000);
    }, 1000);
  });
};

/* istanbul ignore next */
const get = async <T>(
  params: TokenRequestParams,
  timeout: number = 10,
): Promise<T> => {
  const url = `${HiveEngineConfigUtils.getApi()}/contracts`;
  return new Promise((resolve, reject) => {
    let resolved = false;
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'find',
        params,
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (res && res.status === 200) {
          resolved = true;
          return res.json();
        }
      })
      .then((res: any) => {
        resolve(res.result as unknown as T);
      });

    setTimeout(() => {
      if (!resolved) {
        reject(new KeychainError('html_popup_tokens_timeout'));
      }
    }, timeout * 1000);
  });
};

/* istanbul ignore next */
const getHistory = async (
  account: string,
  symbol: string,
  offset: number = 0,
  type: string = 'user',
  timeout: number = 10,
): Promise<TokenTransaction[]> => {
  const queryParams = `account=${account}&symbol=${symbol}&offset=${offset}&type=${type}`;

  const url = `${HiveEngineConfigUtils.getAccountHistoryApi()}/accountHistory?${queryParams}`;
  return new Promise((resolve, reject) => {
    let resolved = false;
    fetch(url)
      .then((res) => {
        if (res && res.status === 200) {
          resolved = true;
          return res.json();
        }
      })
      .then((res: any) => {
        resolve(res as unknown as TokenTransaction[]);
      });

    setTimeout(() => {
      if (!resolved) {
        reject(new KeychainError('html_popup_tokens_timeout'));
      }
    }, timeout * 1000);
  });
};

const loadHiddenTokensList = async () => {
  return (
    (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIDDEN_TOKENS,
    )) || []
  );
};

export const HiveEngineUtils = {
  get,
  getDelayedTransactionInfo,
  getHistory,
  sendOperation,
  tryConfirmTransaction,
  loadHiddenTokensList,
};
