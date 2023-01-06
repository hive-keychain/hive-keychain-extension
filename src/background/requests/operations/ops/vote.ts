import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { RequestId, RequestVote } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { BloggingUtils } from 'src/utils/blogging.utils';

export const broadcastVote = async (
  requestHandler: RequestsHandler,
  data: RequestVote & RequestId,
) => {
  const key = requestHandler.data.key;
  let err, result, err_message;
  try {
    result = await BloggingUtils.vote(
      data.username,
      data.author,
      data.permlink,
      +data.weight,
      key!,
    );
  } catch (e: any) {
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
      await chrome.i18n.getMessage('bgd_ops_vote', [
        data.author,
        data.permlink,
        +data.weight / 100 + '',
      ]),
      err_message,
    );
    return message;
  }
};
