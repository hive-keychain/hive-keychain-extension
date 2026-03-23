import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { RequestId, RequestSignTx } from '@interfaces/keychain.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import { validateSignTxTransaction } from 'src/utils/sign-tx.utils';

import Logger from 'src/utils/logger.utils';

const validateCurrentSignTx = async (tx: RequestSignTx['tx']) => {
  const now = new Date();
  let validation = validateSignTxTransaction(tx, { now });

  if (!validation.ok) {
    return validation;
  }

  try {
    const props = await DynamicGlobalPropertiesUtils.getDynamicGlobalProperties();
    validation = validateSignTxTransaction(validation.value.transaction, {
      now,
      currentHeadBlockNumber: props.head_block_number,
    });
  } catch (_error) {
    Logger.warn('Skipping signTx head block freshness check');
  }

  return validation;
};

export const signTx = async (
  requestHandler: RequestsHandler,
  data: RequestSignTx & RequestId,
) => {
  let key = requestHandler.data.key;
  let result, err, err_message;

  const validation = await validateCurrentSignTx(data.tx);
  if (!validation.ok) {
    return createMessage(
      'invalid_transaction',
      undefined,
      data,
      null,
      validation.error.message,
    );
  }

  const transaction = validation.value.transaction;

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        LedgerModule.signTransactionFromLedger({
          transaction: transaction,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = {
          ...transaction,
          signatures: [...(transaction.signatures || []), signature],
        };
        break;
      }
      default: {
        result = await HiveTxUtils.signTransaction(transaction, key!);
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    if (e instanceof KeychainError) {
      err = (e as KeychainError).trace || e;
      err_message = await chrome.i18n.getMessage(
        (e as KeychainError).message,
        (e as KeychainError).messageParams,
      );
    } else {
      err = e;
      err_message = await chrome.i18n.getMessage('unknown_error');
    }
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_sign_tx'),
      err_message,
    );
    return message;
  }
};
