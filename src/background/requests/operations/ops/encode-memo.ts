import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { ExtendedAccount } from '@hiveio/dhive';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';

const VALID_KEY_TYPES = 'Posting, Active, or Memo';

const normalizeKeyType = (method: string): KeychainKeyTypesLC => {
  const keyType = typeof method === 'string' ? method.trim().toLowerCase() : '';

  switch (keyType) {
    case KeychainKeyTypesLC.memo:
    case KeychainKeyTypesLC.posting:
    case KeychainKeyTypesLC.active:
      return keyType;
    default:
      throw new Error(
        `Invalid key type "${method}". Expected ${VALID_KEY_TYPES}.`,
      );
  }
};

const recipientPublicKeyForMethod = (
  receiver: ExtendedAccount,
  keyType: KeychainKeyTypesLC,
) => {
  switch (keyType) {
    case KeychainKeyTypesLC.memo:
      return receiver.memo_key;
    case KeychainKeyTypesLC.posting:
      return receiver.posting.key_auths[0][0];
    case KeychainKeyTypesLC.active:
      return receiver.active.key_auths[0][0];
  }
};

export const encodeMessage = async (
  requestHandler: RequestsHandler,
  data: RequestEncode & RequestId,
) => {
  let encoded = null;
  let error = null;
  try {
    const key = requestHandler.data.key;
    const keyType = normalizeKeyType(data.method);
    const receiver = await AccountUtils.getExtendedAccount(data.receiver);
    const publicKey = recipientPublicKeyForMethod(receiver, keyType);
    encoded = encode(key, publicKey, data.message);
  } catch (err) {
    error = err;
  } finally {
    return await createMessage(
      error,
      encoded,
      data,
      await chrome.i18n.getMessage('bgd_ops_encode'),
      await chrome.i18n.getMessage('bgd_ops_encode_err'),
    );
  }
};
