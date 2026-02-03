import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSendToken,
} from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';

export const broadcastSendToken = async (
  requestHandler: RequestsHandler,
  data: RequestSendToken & RequestId,
  options?: TransactionOptions,
) => {
  let err, err_message, result;
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKeyPair(
      data.username!,
      KeychainKeyTypesLC.active,
    ) as [string, string];
  }
  const memoKey: string = requestHandler.getUserKeyPair(
    data.username!,
    KeychainKeyTypesLC.memo,
  )[0];
  try {
    let memo = data.memo || '';

    const receiver = await AccountUtils.getExtendedAccount(data.to);

    if (!receiver) {
      throw new KeychainError('bgd_ops_transfer_get_account', [data.to]);
    }

    if (data.memo && data.memo.length > 0 && data.memo[0] == '#') {
      if (!memoKey) {
        throw new KeychainError('popup_html_memo_key_missing');
      }
      const memoReceiver = receiver.memo_key;
      memo = encode(memoKey, memoReceiver, memo);
    }
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const tx = await TokensUtils.getSendTokenTransaction(
          data.currency,
          data.to,
          data.amount,
          memo,
          data.username!,
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
        result = await TokensUtils.sendToken(
          data.currency,
          data.to,
          data.amount,
          memo,
          key!,
          data.username!,
          options,
        );
        break;
      }
    }
  } catch (e: any) {
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_tokens'),
      err_message,
    );
    return message;
  }
};
