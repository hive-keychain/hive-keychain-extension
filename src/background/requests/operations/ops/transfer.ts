import { ActiveAccountModule } from '@background/active-account.module';
import MkModule from '@background/mk.module';
import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/utils/account.utils';
import Logger from 'src/utils/logger.utils';
import TransferUtils from 'src/utils/transfer.utils';

export const broadcastTransfer = async (
  requestHandler: RequestsHandler,
  data: RequestTransfer & RequestId,
) => {
  let result,
    err: any,
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

    const [receiver, userAccount] = await AccountUtils.getExtendedAccounts([
      to,
      data.username!,
    ]);
    // const receiver = (await client.database.getAccounts([to]))[0];

    if (data.memo && data.memo.length > 0 && data.memo[0] == '#') {
      if (!receiver || !memoKey) {
        throw new Error('Could not encode memo.');
      }
      const memoReceiver = receiver.memo_key;
      memo = encode(memoKey, memoReceiver, memo);
    }

    const localAccounts = await AccountUtils.getAccountsFromLocalStorage(
      await MkModule.getMk(),
    );

    const activeAccount = await ActiveAccountModule.createActiveAccount(
      userAccount,
      localAccounts,
    );

    result = await TransferUtils.sendTransfer(
      data.username!,
      data.to,
      data.amount + ' ' + data.currency,
      memo,
      false,
      0,
      0,
      activeAccount!,
    );

    // result = await client.broadcast.transfer(
    //   {
    //     from: data.username!,
    //     to: data.to,
    //     amount: data.amount + ' ' + data.currency,
    //     memo,
    //   },
    //   PrivateKey.from(key!),
    // );
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
      if (!err['jse_info']) {
        err_message = await chrome.i18n.getMessage(
          'bgd_ops_error_broadcasting',
        );
      } else {
        const { jse_info } = err; //hiveoio sending a custom error.
        const { stack } = jse_info;
        switch (stack[0].context.method) {
          case 'adjust_balance':
            err_message = await chrome.i18n.getMessage(
              'bgd_ops_transfer_adjust_balance',
              [data.currency, data.username!],
            );
            break;
          case 'get_account':
            err_message = await chrome.i18n.getMessage(
              'bgd_ops_transfer_get_account',
              [data.to],
            );
            break;
          default:
            err_message = await chrome.i18n.getMessage(
              'bgd_ops_error_broadcasting',
            );
            break;
        }
      }
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
