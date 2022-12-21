import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import Logger from 'src/utils/logger.utils';
const signature = require('@hiveio/hive-js/lib/auth/ecc');

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
      [key, publicKey] = requestHandler.getUserKeyPair(
        data.username!,
        data.method.toLowerCase() as KeychainKeyTypesLC,
      ) as [string, string];
    }
    signed = await signMessage(data.message, key!);
  } catch (err) {
    Logger.error(err);
    error = err;
  } finally {
    return createMessage(
      error,
      signed,
      data,
      await chrome.i18n.getMessage('bgd_ops_sign_success'),
      await chrome.i18n.getMessage('bgd_ops_sign_error'),
      publicKey,
    );
  }
};

const signMessage = (message: string, privateKey: string) => {
  let buf;
  try {
    const o = JSON.parse(message, (k, v) => {
      if (
        v !== null &&
        typeof v === 'object' &&
        'type' in v &&
        v.type === 'Buffer' &&
        'data' in v &&
        Array.isArray(v.data)
      ) {
        return Buffer.from(v.data);
      }
      return v;
    });
    if (Buffer.isBuffer(o)) {
      buf = o;
    } else {
      buf = message;
    }
  } catch (e) {
    buf = message;
  }
  return signature.Signature.signBuffer(buf, privateKey).toHex();
};
