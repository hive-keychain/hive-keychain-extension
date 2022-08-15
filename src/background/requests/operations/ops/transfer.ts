import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { PrivateKey } from '@hiveio/dhive';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import Logger from 'src/utils/logger.utils';

export const broadcastTransfer = async (
  requestHandler: RequestsHandler,
  data: RequestTransfer & RequestId,
) => {
  let result,
    err,
    err_message = null;
  try {
    const { username, to } = data;
    const client = requestHandler.getHiveClient();
    const memoKey: string = requestHandler.getUserKey(
      username!,
      KeychainKeyTypesLC.memo,
    )[0];
    const [key] = requestHandler.getUserKey(
      data.username!,
      KeychainKeyTypesLC.active,
    );
    let memo = data.memo || '';
    if (data.memo && data.memo.length > 0 && data.memo[0] == '#') {
      const receiver = (await client.database.getAccounts([to]))[0];

      if (!receiver) {
        throw new Error('Could not encode memo.');
      }
      const memoReceiver = receiver.memo_key;
      memo = encode(memoKey, memoReceiver, memo);
    }

    result = await client.broadcast.transfer(
      {
        from: data.username!,
        to: data.to,
        amount: data.amount + ' ' + data.currency,
        memo,
      },
      PrivateKey.from(key!),
    );
  } catch (e) {
    Logger.error(e);
    if (typeof e === 'string') {
      const message = createMessage(
        true,
        null,
        data,
        null,
        'Could not encode memo.',
      );
      return message;
    } else {
      err = e;
      console.log('e: ', e);
      console.log('e method: ', (err as any).jse_info.stack[0].context.method);
      // if (!(err as any)?.data?.stack[0]?.context?.method)
      //   err_message = await chrome.i18n.getMessage(
      //     'bgd_ops_error_broadcasting',
      //   );
      // else {
      switch ((err as any).data.stack[0].context.method) {
        case 'adjust_balance':
          console.log('adjust_balance');
          err_message = await chrome.i18n.getMessage(
            'bgd_ops_transfer_adjust_balance',
            [data.currency, data.username!],
          );
          break;
        case 'get_account':
          console.log('get_account');
          err_message = await chrome.i18n.getMessage(
            'bgd_ops_transfer_get_account',
            [data.to],
          );
          break;
        default:
          console.log('default');
          err_message = await chrome.i18n.getMessage(
            'bgd_ops_error_broadcasting',
          );
          break;
      }
      //}
    }
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_transfer_success', [
        data.amount,
        data.currency,
        data.username!,
        data.to,
      ]),
      err_message,
    );
    return message;
  }
};
