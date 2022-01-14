import { getRequestHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestDecode, RequestId } from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';

export const decodeMessage = async (data: RequestDecode & RequestId) => {
  let decoded = null;
  let error = null;
  const key = getRequestHandler().key;
  try {
    decoded = await HiveUtils.decodeMemo(data.message, key!);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      decoded,
      data,
      chrome.i18n.getMessage('bgd_ops_decode'),
      chrome.i18n.getMessage('bgd_ops_decode_err'),
    );
  }
};
