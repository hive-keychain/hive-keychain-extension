import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage, feedbackI18n } from '@background/hive/requests/operations/operations.utils';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypes,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
export const encodeMessage = async (
  requestHandler: HiveRequestsHandler,
  data: RequestEncode & RequestId,
) => {
  const request = requestHandler.getRequestData(data.request_id);

  let encoded = null;
  let error = null;
  try {
    const key = requestHandler.getRequestData(data.request_id)?.key;
    const receiver = await AccountUtils.getExtendedAccount(data.receiver);
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
    return await createMessage(
      error,
      encoded,
      data,
      request?.tab!,
      feedbackI18n('bgd_ops_encode'),
      feedbackI18n('bgd_ops_encode_err'),
    );
  }
};
