import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import { RequestId, RequestVote } from '@interfaces/keychain.interface';

export const broadcastVote = async (
  requestHandler: RequestsHandler,
  data: RequestVote & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  const key = requestHandler.data.key;
  let err, result;
  try {
    result = await client?.broadcast.vote(
      {
        voter: data.username,
        author: data.author,
        permlink: data.permlink,
        weight: +data.weight,
      },
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  }
  const err_message = await beautifyErrorMessage(err);
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
};
