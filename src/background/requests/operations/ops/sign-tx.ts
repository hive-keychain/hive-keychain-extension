import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { RequestId, RequestSignTx } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

import Logger from 'src/utils/logger.utils';

export const signTx = async (
  requestHandler: RequestsHandler,
  data: RequestSignTx & RequestId,
) => {
  let key = requestHandler.data.key;
  let result, err, err_message;

  try {
    result = await HiveTxUtils.signTransaction(data.tx, key!);
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
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
