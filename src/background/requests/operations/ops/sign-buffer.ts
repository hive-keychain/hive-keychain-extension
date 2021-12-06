import { getRequestHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestId, RequestSignBuffer } from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';

export const signBuffer = (data: RequestSignBuffer & RequestId) => {
  let signed = null;
  let error = null;
  try {
    const key = getRequestHandler().key;
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
      getRequestHandler().publicKey,
    );
  }
};
