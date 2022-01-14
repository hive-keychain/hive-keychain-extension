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

export const broadcastOperations = async (
  data: RequestBroadcast & RequestId,
) => {
  let result, err;
  const client = getRequestHandler().getHiveClient();
  const key = getRequestHandler().key;

  let operations: Operation[] =
    typeof data.operations === 'string'
      ? JSON.parse(data.operations)
      : data.operations;

  // check if operations contains any transfer wich requires memo encryption
  try {
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
      }
    }

    result = await client.broadcast.sendOperations(
      operations,
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
      chrome.i18n.getMessage('bgd_ops_broadcast'),
      err_message,
    );
    return message;
  }
};
