import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';
import {
  KeyType,
  PrivateKeyType,
  TransactionOptions,
} from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
import { CustomJsonUtils } from 'src/popup/hive/utils/custom-json.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastCustomJson = async (
  requestHandler: RequestsHandler,
  data: RequestCustomJSON & RequestId,
  options?: TransactionOptions,
) => {
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKeyPair(
      data.username!,
      data.method.toLowerCase() as KeychainKeyTypesLC,
    ) as [string, string];
  }
  let result, err, err_message;

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await CustomJsonUtils.getCustomJsonTransaction(
          data.json,
          data.username!,
          data.method.toUpperCase() as KeyType,
          data.id,
        );
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await CustomJsonUtils.send(
          data.json,
          data.username!,
          key!,
          data.method.toUpperCase() as KeyType,
          data.id,
          options,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_broadcast'),
      err_message,
    );

    return message;
  }
};
