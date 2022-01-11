import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import {
  RequestId,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';

export const broadcastUpdateProposalVote = async (
  data: RequestUpdateProposalVote & RequestId,
) => {
  const client = getRequestHandler().getHiveClient();
  const key = getRequestHandler().key;
  let result, err;
  try {
    result = await client.broadcast.sendOperations(
      [
        [
          'update_proposal_votes',
          {
            voter: data.username,
            proposal_ids:
              typeof data.proposal_ids === 'string'
                ? JSON.parse(data.proposal_ids)
                : data.proposal_ids,
            approve: data.approve,
            extensions:
              typeof data.extensions === 'string'
                ? JSON.parse(data.extensions)
                : data.extensions,
          },
        ],
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    let messageText = '';
    const ids =
      typeof data.proposal_ids === 'string'
        ? JSON.parse(data.proposal_ids)
        : data.proposal_ids;
    if (data.approve) {
      if (ids.length === 1)
        messageText = chrome.i18n.getMessage('bgd_ops_proposal_vote', [ids[0]]);
      else {
        messageText = chrome.i18n.getMessage('bgd_ops_proposal_votes', [
          ids.join(', #'),
        ]);
      }
    } else {
      if (ids.length === 1)
        messageText = chrome.i18n.getMessage('bgd_ops_proposal_unvote', [
          ids[0],
        ]);
      else
        messageText = chrome.i18n.getMessage('bgd_ops_proposal_unvotes', [
          ids.join(', #'),
        ]);
    }
    const message = createMessage(err, result, data, messageText, err_message);
    return message;
  }
};
