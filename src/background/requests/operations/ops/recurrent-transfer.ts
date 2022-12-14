import { RequestsHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import { PrivateKey, RecurrentTransferOperation } from '@hiveio/dhive';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestRecurrentTransfer,
} from '@interfaces/keychain.interface';
import CurrencyUtils from 'src/utils/currency.utils';
import Logger from 'src/utils/logger.utils';

export const recurrentTransfer = async (
  requestHandler: RequestsHandler,
  data: RequestRecurrentTransfer & RequestId,
) => {
  const { username, to, amount, recurrence, executions } = data;
  let { memo } = data;
  let currency = CurrencyUtils.getCurrencyLabel(
    data.currency,
    requestHandler.data.rpc?.testnet || false,
  );
  const client = requestHandler.getHiveClient();
  let result, err;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKey(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }
    if (memo && memo.length > 0 && memo[0] == '#') {
      const receiver = (await client!.database.getAccounts([to]))[0];
      const memoKey: string = requestHandler.getUserKey(
        username!,
        KeychainKeyTypesLC.memo,
      )[0];
      if (!receiver || !memoKey) {
        throw new Error('Could not encode memo.');
      }
      const memoReceiver = receiver.memo_key;
      memo = encode(memoKey, memoReceiver, memo);
    }
    result = await client?.broadcast.sendOperations(
      [
        [
          'recurrent_transfer',
          {
            from: username,
            to,
            amount: `${amount} ${currency}`,
            memo: memo || '',
            recurrence,
            executions,
            extensions: [],
          },
        ] as RecurrentTransferOperation,
      ],
      PrivateKey.from(key!),
    );
  } catch (e) {
    Logger.error(e);
    err = e;
  } finally {
    const err_message = await beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      parseFloat(amount) === 0
        ? await chrome.i18n.getMessage('bgd_ops_stop_recurrent_transfer')
        : await chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
      err_message,
    );
    return message;
  }
};
