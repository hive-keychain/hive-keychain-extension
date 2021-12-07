import { getRequestHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';

export const signBuffer = (data: RequestSignBuffer & RequestId) => {
  let signed = null;
  let error = null;
  let publicKey = getRequestHandler().publicKey;

  try {
    let key = getRequestHandler().key;
    if (!key) {
      [key, publicKey] = getRequestHandler().getUserKey(
        data.username!,
        data.method.toLowerCase() as KeychainKeyTypesLC,
      ) as [string, string];
    }
    signed = HiveUtils.signMessage(data.message, key!);
  } catch (err) {
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
