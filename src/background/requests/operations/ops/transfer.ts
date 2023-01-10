import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import AccountUtils from 'src/utils/account.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import { KeysUtils } from 'src/utils/keys.utils';
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
    const memoKey: string = requestHandler.getUserKeyPair(
      username!,
      KeychainKeyTypesLC.memo,
    )[0];
    let memo = data.memo || '';

    const receiver = await AccountUtils.getExtendedAccount(to);

    if (!receiver) {
      throw new KeychainError('bgd_ops_transfer_get_account', [to]);
    }

    if (data.memo && data.memo.length > 0 && data.memo[0] == '#') {
      if (!memoKey) {
        throw new KeychainError('popup_html_memo_key_missing');
      }
      const memoReceiver = receiver.memo_key;
      memo = encode(memoKey, memoReceiver, memo);
    }

    const key = requestHandler.getUserPrivateKey(
      username!,
      KeychainKeyTypesLC.active,
    );

    if (KeysUtils.isUsingLedger(key!)) {
      const tx = await TransferUtils.getTransferTransaction(
        data.username!,
        data.to,
        data.amount + ' ' + data.currency,
        memo,
        false,
        0,
        0,
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
    } else {
      result = await TransferUtils.sendTransfer(
        data.username!,
        data.to,
        data.amount + ' ' + data.currency,
        memo,
        false,
        0,
        0,
        key!,
      );
    }
  } catch (e: any) {
    if (typeof e === 'string') {
      const message = createMessage(
        true,
        null,
        data,
        null,
        await chrome.i18n.getMessage('bgd_ops_encode_err'),
      );
      return message;
    } else {
      err = (e as KeychainError).trace || e;
      err_message = await chrome.i18n.getMessage(
        (e as KeychainError).message,
        (e as KeychainError).messageParams,
      );
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
