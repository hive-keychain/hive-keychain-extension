import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import { RequestId, RequestVote } from '@interfaces/keychain.interface';

export const broadcastVote = async (data: RequestVote & RequestId) => {
  const client = getRequestHandler().getHiveClient();
  const key = getRequestHandler().key;
  let err, result;
  try {
    result = await client.broadcast.vote(
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
  const err_message = beautifyErrorMessage(err);
  const message = createMessage(
    err,
    result,
    data,
    chrome.i18n.getMessage('bgd_ops_vote', [
      data.author,
      data.permlink,
      +data.weight / 100 + '',
    ]),
    err_message,
  );
  return message;
};
