import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { AccountWitnessVoteOperation, PrivateKey } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestWitnessVote,
} from '@interfaces/keychain.interface';

export const broadcastWitnessVote = async (
  requestHandler: RequestsHandler,
  data: RequestWitnessVote & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  let result, err;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKey(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }

    result = await client?.broadcast.sendOperations(
      [
        [
          'account_witness_vote',
          {
            account: data.username,
            witness: data.witness,
            approve: data.vote,
          },
        ] as AccountWitnessVoteOperation,
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = await beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      data.vote
        ? await chrome.i18n.getMessage('bgd_ops_witness_voted', [data.witness])
        : await chrome.i18n.getMessage('bgd_ops_witness_unvoted', [
            data.witness,
          ]),
      err_message,
    );
    return message;
  }
};
