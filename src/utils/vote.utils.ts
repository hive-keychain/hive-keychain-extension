import { VoteOperation } from '@hiveio/dhive';
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

export const VoteUtils = { vote };
