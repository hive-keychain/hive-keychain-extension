import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { Operation, PrivateKey } from '@hiveio/dhive';
import {
  KeychainKeyTypesLC,
  RequestBroadcast,
  RequestId,
} from '@interfaces/keychain.interface';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

export const broadcastOperations = async (
  data: RequestBroadcast & RequestId,
) => {
  let result, err;
  const client = getRequestHandler().getHiveClient();
  const key = getRequestHandler().key;

  // check if operations contains any transfer wich requires memo encryption
  try {
    let operations: Operation[] =
      typeof data.operations === 'string'
        ? JSON.parse(data.operations)
        : data.operations;

    for (const op of operations) {
      if (op[0] === 'transfer') {
        const memo = op[1].memo;
        if (memo && memo.length > 0 && memo[0] == '#') {
          const receiver = await client.database.getAccounts([op[1].to]);
          const memoKey: string = getRequestHandler().getUserKey(
            data.username!,
            KeychainKeyTypesLC.memo,
          )[0];
          if (!receiver) {
            throw new Error('Failed to load receiver memo key');
          }
          const memoReceiver = receiver[0].memo_key;
          op[1].memo = HiveUtils.encodeMemo(memo, memoKey, memoReceiver);
        }
      } else if (
        op[0] === 'update_proposal_votes' ||
        op[0] === 'create_proposal' ||
        op[0] === 'remove_proposal'
      ) {
        if (!op[1].extensions) {
          op[1].extensions = [];
        }
        if (
          op[0] === 'update_proposal_votes' &&
          typeof op[1].approve === 'string'
        ) {
          op[1].approve = op[1].approve === 'true';
        }
      }
    }
    Logger.log(operations, key);
    result = await client.broadcast.sendOperations(
      operations,
      PrivateKey.from(key!),
    );
  } catch (e) {
    Logger.error('Generic broadcast', e);
    Logger.error(e);
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_broadcast'),
      err_message,
    );
    return message;
  }
};
