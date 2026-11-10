import LedgerModule from '@background/hive/modules/ledger.module';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage, feedbackI18n } from '@background/hive/requests/operations/operations.utils';
import { RequestId, RequestSignTx } from '@interfaces/keychain.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';

import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export const signTx = async (
  requestHandler: HiveRequestsHandler,
  data: RequestSignTx & RequestId,
) => {
  let key = requestHandler.getRequestData(data.request_id)?.key;
  let result, err, err_message;

  const request = requestHandler.getRequestData(data.request_id);

  const transaction = data.tx;
  if (!transaction.extensions) {
    transaction.extensions = [];
  }
  if (typeof transaction.expiration !== 'string') {
    transaction.expiration = (transaction.expiration as Date).toISOString();
  }

  transaction.expiration = transaction.expiration.split('.')[0];

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        LedgerModule.signTransactionFromLedger({
          transaction: transaction,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = { ...transaction, signatures: [signature] };
        break;
      }
      default: {
        result = await HiveTxUtils.signTransaction(transaction, key!);
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = feedbackI18n(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    return await createMessage(
      err,
      result,
      data,
      request?.tab!,
      feedbackI18n('bgd_ops_sign_tx'),
      err_message,
    );
  }
};
