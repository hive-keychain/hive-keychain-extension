import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

export const signBuffer = async (
  requestHandler: RequestsHandler,
  data: RequestSignBuffer & RequestId,
) => {
  let signed = null;
  let error = null;
  let publicKey = requestHandler.data.publicKey;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key, publicKey] = requestHandler.getUserKey(
        data.username!,
        data.method.toLowerCase() as KeychainKeyTypesLC,
      ) as [string, string];
    }
    signed = await HiveUtils.signMessage(data.message, key!);
  } catch (err) {
    Logger.error(err);
    error = err;
  } finally {
    return createMessage(
      error,
      signed,
      data,
      chrome.i18n.getMessage('bgd_ops_sign_success'),
      chrome.i18n.getMessage('bgd_ops_sign_error'),
      publicKey,
    );
  }
};
