import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import {
  CreateProposalOperation,
  PrivateKey,
  RemoveProposalOperation,
} from '@hiveio/dhive';
import {
  RequestCreateProposal,
  RequestId,
  RequestRemoveProposal,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';

export const broadcastCreateProposal = async (
  requestHandler: RequestsHandler,
  data: RequestCreateProposal & RequestId,
) => {
  let err, result;
  const client = requestHandler.getHiveClient();
  const key = requestHandler.data.key;
  try {
    result = await client.broadcast.sendOperations(
      [
        [
          'create_proposal',
          {
            creator: data.username,
            receiver: data.receiver,
            start_date: data.start,
            end_date: data.end,
            daily_pay: data.daily_pay,
            subject: data.subject,
            permlink: data.permlink,
            extensions:
              typeof data.extensions === 'string'
                ? JSON.parse(data.extensions)
                : data.extensions,
          },
        ] as CreateProposalOperation,
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_proposal_create'),
      err_message,
    );
    return message;
  }
};

export const broadcastUpdateProposalVote = async (
  requestHandler: RequestsHandler,
  data: RequestUpdateProposalVote & RequestId,
) => {
  const client = requestHandler.getHiveClient();
  const key = requestHandler.data.key;
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

export const broadcastRemoveProposal = async (
  requestHandler: RequestsHandler,
  data: RequestRemoveProposal & RequestId,
) => {
  let err, result;
  const client = requestHandler.getHiveClient();
  const key = requestHandler.data.key;
  try {
    result = await client.broadcast.sendOperations(
      [
        [
          'remove_proposal',
          {
            proposal_owner: data.username,
            proposal_ids:
              typeof data.proposal_ids === 'string'
                ? JSON.parse(data.proposal_ids)
                : data.proposal_ids,
            extensions:
              typeof data.extensions === 'string'
                ? JSON.parse(data.extensions)
                : data.extensions,
          },
        ] as RemoveProposalOperation,
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_proposal_remove', [
        typeof data.proposal_ids === 'string'
          ? JSON.parse(data.proposal_ids)[0]
          : data.proposal_ids[0],
      ]),
      err_message,
    );
    return message;
  }
};
