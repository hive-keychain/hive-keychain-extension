import {
  CommentOperation,
  CommentOptionsOperation,
  VoteOperation,
} from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const vote = (
  voter: string,
  author: string,
  permlink: string,
  weight: number,
  privateKey: Key,
) => {
  return HiveTxUtils.sendOperation(
    [
      [
        'vote',
        {
          voter: voter,
          author: author,
          permlink: permlink,
          weight: weight,
        },
      ] as VoteOperation,
    ],
    privateKey,
  );
};
const post = async (
  parentUsername: string,
  parentPerm: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  stringifyMetadata: string,
  key: Key,
) => {
  return HiveTxUtils.sendOperation(
    [
      [
        'comment',
        {
          parent_author: parentUsername,
          parent_permlink: parentPerm,
          author: author,
          permlink: permlink,
          title: title,
          body: body,
          json_metadata: stringifyMetadata,
        },
      ] as CommentOperation,
    ],
    key,
  );
};

const comment = async (
  parentUsername: string,
  parentPerm: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  stringifyMetadata: string,
  stringifyCommentOptions: string,
  key: Key,
) => {
  const operations = [
    [
      'comment',
      {
        parent_author: parentUsername,
        parent_permlink: parentPerm,
        author: author,
        permlink: permlink,
        title: title,
        body: body,
        json_metadata: stringifyMetadata,
      },
    ] as CommentOperation,
    [
      'comment_options',
      JSON.parse(stringifyCommentOptions),
    ] as CommentOptionsOperation,
  ];

  return HiveTxUtils.sendOperation(operations, key);
};

export const BloggingUtils = {
  comment,
  post,
  vote,
};
