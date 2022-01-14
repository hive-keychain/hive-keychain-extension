import { getRequestHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import { RequestId, RequestSendToken } from '@interfaces/keychain.interface';
import HiveEngineUtils from 'src/utils/hive-engine.utils';

export const broadcastSendToken = async (
  data: RequestSendToken & RequestId,
) => {
  let err, result;
  const client = getRequestHandler().getHiveClient();
  let key = getRequestHandler().key;
  try {
    result = await HiveEngineUtils.sendToken(
      client,
      data,
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_tokens'),
      chrome.i18n.getMessage('bgd_ops_error_broadcasting'),
    );
    return message;
  }
};
