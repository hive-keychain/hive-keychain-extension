import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import AccountUtils from '@hiveapp/utils/account.utils';
import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { KeysUtils } from '@hiveapp/utils/keys.utils';
import TransferUtils from '@hiveapp/utils/transfer.utils';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestRecurrentTransfer,
} from '@interfaces/keychain.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { KeychainError } from 'src/keychain-error';
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
  let result, err, err_message;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKeyPair(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }
    if (memo && memo.length > 0 && memo[0] == '#') {
      const receiver = await AccountUtils.getExtendedAccount(to);
      const memoKey: string = requestHandler.getUserKeyPair(
        username!,
        KeychainKeyTypesLC.memo,
      )[0];
      if (!receiver || !memoKey) {
        throw new KeychainError('bgd_ops_encode_err');
      }
      const memoReceiver = receiver.memo_key;
      memo = encode(memoKey, memoReceiver, memo);
    }

    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await TransferUtils.getTransferTransaction(
          username!,
          to,
          `${amount} ${currency}`,
          memo || '',
          true,
          executions,
          recurrence,
        );

        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        result = await TransferUtils.sendTransfer(
          username!,
          to,
          `${amount} ${currency}`,
          memo || '',
          true,
          executions,
          recurrence,
          key,
        );
        break;
      }
    }
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
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
