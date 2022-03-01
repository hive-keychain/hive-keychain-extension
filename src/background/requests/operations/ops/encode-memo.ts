import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypes,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
export const encodeMessage = async (
  requestHandler: RequestsHandler,
  data: RequestEncode & RequestId,
) => {
  let encoded = null;
  let error = null;
  try {
    const client = requestHandler.getHiveClient();
    const key = requestHandler.data.key;
    const receiver = (await client.database.getAccounts([data.receiver]))[0];
    let publicKey;

    if (data.method === KeychainKeyTypes.memo) {
      publicKey = receiver.memo_key;
    } else {
      publicKey = receiver.posting.key_auths[0][0];
    }

    encoded = encode(key, publicKey, data.message);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      encoded,
      data,
      await chrome.i18n.getMessage('bgd_ops_encode'),
      await chrome.i18n.getMessage('bgd_ops_encode_err'),
    );
  }
};
