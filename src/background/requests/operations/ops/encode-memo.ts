import { getRequestHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import {
  KeychainKeyTypes,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';

export const encodeMessage = async (data: RequestEncode & RequestId) => {
  let encoded = null;
  let error = null;
  try {
    const client = getRequestHandler().getHiveClient();
    const key = getRequestHandler().key;
    const receiver = (await client.database.getAccounts([data.receiver]))[0];
    let publicKey;

    if (data.method === KeychainKeyTypes.memo) {
      publicKey = receiver.memo_key;
    } else {
      publicKey = receiver.posting.key_auths[0][0];
    }

    encoded = HiveUtils.encodeMemo(data.message, key!, publicKey as string);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      encoded,
      data,
      chrome.i18n.getMessage('bgd_ops_encode'),
      chrome.i18n.getMessage('bgd_ops_encode_err'),
    );
  }
};
