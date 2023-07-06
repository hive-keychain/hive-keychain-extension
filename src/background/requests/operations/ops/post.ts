import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { BloggingUtils } from '@hiveapp/utils/blogging.utils';
import { RequestId, RequestPost } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import Logger from 'src/utils/logger.utils';

// TODO : when compatible
export const broadcastPost = async (
  requestHandler: RequestsHandler,
  data: RequestPost & RequestId,
) => {
  let err, result, err_message;
  const key = requestHandler.data.key;
  try {
    if (data.comment_options === '') {
      result = await BloggingUtils.post(
        data.parent_username || '',
        data.parent_perm,
        data.username,
        data.permlink,
        data.title || '',
        data.body,
        data.json_metadata,
        key!,
      );
    } else {
      result = await BloggingUtils.comment(
        data.parent_username || '',
        data.parent_perm,
        data.username,
        data.permlink,
        data.title || '',
        data.body,
        data.json_metadata,
        data.comment_options,
        key!,
      );
    }
  } catch (e: any) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_post'),
      err_message,
    );
    return message;
  }
};
