import type {
  CommentOperation,
  CommentOptionsOperation,
  VoteOperation,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

const vote = (
  voter: string,
  author: string,
  permlink: string,
  weight: number,
  privateKey: Key,
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [BloggingUtils.getVoteOperation(voter, author, permlink, weight)],
    privateKey,
    false,
    options,
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
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    [
      BloggingUtils.getPostOperation(
        parentUsername,
        parentPerm,
        author,
        permlink,
        title,
        body,
        stringifyMetadata,
      ),
    ],
    key,
    false,
    options,
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
  options?: TransactionOptions,
) => {
  return HiveTxUtils.sendOperation(
    BloggingUtils.getCommentOperation(
      parentUsername,
      parentPerm,
      author,
      permlink,
      title,
      body,
      stringifyMetadata,
      stringifyCommentOptions,
    ),
    key,
    false,
    options,
  );
};

const getCommentTransaction = (
  parentUsername: string,
  parentPerm: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  stringifyMetadata: string,
  stringifyCommentOptions: string,
) => {
  return HiveTxUtils.createTransaction(
    BloggingUtils.getCommentOperation(
      parentUsername,
      parentPerm,
      author,
      permlink,
      title,
      body,
      stringifyMetadata,
      stringifyCommentOptions,
    ),
  );
};

const getVoteTransaction = (
  voter: string,
  author: string,
  permlink: string,
  weight: number,
) => {
  return HiveTxUtils.createTransaction([
    BloggingUtils.getVoteOperation(voter, author, permlink, weight),
  ]);
};

const getPostTransaction = (
  parentUsername: string,
  parentPerm: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  stringifyMetadata: string,
) => {
  return HiveTxUtils.createTransaction([
    BloggingUtils.getPostOperation(
      parentUsername,
      parentPerm,
      author,
      permlink,
      title,
      body,
      stringifyMetadata,
    ),
  ]);
};

const getCommentOperation = (
  parentUsername: string,
  parentPerm: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  stringifyMetadata: string,
  stringifyCommentOptions: string,
) => {
  const commentOp = [
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
  ] as CommentOperation;

  // If comment_options is empty, use default values
  const commentOptions = stringifyCommentOptions
    ? JSON.parse(stringifyCommentOptions)
    : {
        author: author,
        permlink: permlink,
        max_accepted_payout: '1000000.000 HBD',
        percent_hbd: 10000,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions: [],
      };

  return [
    commentOp,
    ['comment_options', commentOptions] as CommentOptionsOperation,
  ];
};

const getVoteOperation = (
  voter: string,
  author: string,
  permlink: string,
  weight: number,
) => {
  return [
    'vote',
    {
      voter: voter,
      author: author,
      permlink: permlink,
      weight: weight,
    },
  ] as VoteOperation;
};

const getPostOperation = (
  parentUsername: string,
  parentPerm: string,
  author: string,
  permlink: string,
  title: string,
  body: string,
  stringifyMetadata: string,
) => {
  return [
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
  ] as CommentOperation;
};
export const BloggingUtils = {
  comment,
  post,
  vote,
  getPostOperation,
  getPostTransaction,
  getCommentOperation,
  getCommentTransaction,
  getVoteOperation,
  getVoteTransaction,
};
