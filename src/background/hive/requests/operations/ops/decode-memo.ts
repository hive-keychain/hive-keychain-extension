import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage, feedbackI18n } from '@background/hive/requests/operations/operations.utils';
import { decode } from '@hiveio/hive-js/lib/auth/memo';
import { RequestDecode, RequestId } from '@interfaces/keychain.interface';
import { I18nUtils } from 'src/utils/i18n.utils';
export const decodeMessage = async (
  requestHandler: HiveRequestsHandler,
  data: RequestDecode & RequestId,
) => {
  let decoded = null;
  let error = null;
  const request = requestHandler.getRequestData(data.request_id);

  const key = requestHandler.getRequestData(data.request_id)?.key;
  try {
    decoded = await decode(key, data.message);
  } catch (err) {
    error = err;
  } finally {
    return await createMessage(
      error,
      decoded,
      data,
      request?.tab!,
      feedbackI18n('bgd_ops_decode'),
      feedbackI18n('bgd_ops_decode_err'),
    );
  }
};
