import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage, feedbackI18n } from '@background/hive/requests/operations/operations.utils';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  RequestEncodeWithKeys,
  RequestId,
} from '@interfaces/keychain.interface';
import { I18nUtils } from 'src/utils/i18n.utils';
export const encodeWithKeys = async (
  requestHandler: HiveRequestsHandler,
  data: RequestEncodeWithKeys & RequestId,
) => {
  let encoded: { [a: string]: string } = {};
  let error = null;
  const request =
    requestHandler.getRequestData?.(data.request_id) ??
    (requestHandler as any).data;

  try {
    const key =
      requestHandler.getRequestData?.(data.request_id)?.key ??
      (requestHandler as any).data?.key;

    for (const receiverPublicKey of data.publicKeys) {
      encoded[receiverPublicKey.toString()] = encode(
        key,
        receiverPublicKey,
        data.message,
      );
    }
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
