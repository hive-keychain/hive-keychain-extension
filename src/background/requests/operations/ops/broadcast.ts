import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { Operation, PrivateKey } from '@hiveio/dhive';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestBroadcast,
  RequestId,
} from '@interfaces/keychain.interface';

export const broadcastOperations = async (
  requestHandler: RequestsHandler,
  data: RequestBroadcast & RequestId,
) => {
  let result, err;
  const client = requestHandler.getHiveClient();
  const key = requestHandler.data.key;

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
          if (!receiver.length) {
            throw new Error('Failed to load receiver memo key');
          }
          const memoKey: string = requestHandler.getUserKeyPair(
            data.username!,
            KeychainKeyTypesLC.memo,
          )[0];
          if (!memoKey) {
            throw new Error('Failed to load user memo key');
          }
          const memoReceiver = receiver[0].memo_key;
          op[1].memo = encode(memoKey, memoReceiver, memo);
        }
      } else if (
        op[0] === 'update_proposal_votes' ||
        op[0] === 'create_proposal' ||
        op[0] === 'remove_proposal' ||
        op[0] === 'account_update2' ||
        op[0] === 'account_update' ||
        op[0] === 'recurrent_transfer'
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
      } else if (op[0] === 'custom_json') {
        if (!op[1].required_posting_auths) {
          op[1].required_posting_auths = [];
        }
        if (!op[1].required_auths) {
          op[1].required_auths = [];
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
    const err_message = await beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_broadcast'),
      err_message,
    );
    return message;
  }
};
