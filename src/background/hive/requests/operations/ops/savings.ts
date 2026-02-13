import LedgerModule from '@background/hive/modules/ledger.module';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage } from '@background/hive/requests/operations/operations.utils';
import { RequestId, RequestSavings } from '@interfaces/keychain.interface';
import { PrivateKeyType, TransactionOptions } from '@interfaces/keys.interface';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { SavingsUtils } from '@popup/hive/utils/savings.utils';
import { FormatUtils, KeychainKeyTypesLC } from 'hive-keychain-commons';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import Logger from 'src/utils/logger.utils';
export const broadcastSavings = async (
  requestHandler: HiveRequestsHandler,
  data: RequestSavings & RequestId,
  options?: TransactionOptions,
) => {
  let result, err, err_message;
  const request = requestHandler.getRequestData(data.request_id);
  let key = request?.key;
  const amountLabel = `${FormatUtils.formatCurrencyValue(data.amount)} ${
    data.currency
  }`;
  const amount = `${data.amount} ${data.currency}`;
  const isDeposit = data.operation === 'deposit';
  const username = data.username!;
  const memo = data.memo ?? '';
  if (!key) {
    key = requestHandler.getUserPrivateKey(username, KeychainKeyTypesLC.active);
  }

  try {
    switch (KeysUtils.getKeyType(key!)) {
      case PrivateKeyType.LEDGER: {
        const op = isDeposit
          ? await SavingsUtils.getDepositOperation(
              username,
              data.to,
              amount,
              memo,
            )
          : await SavingsUtils.getWithdrawOperation(
              username,
              data.to,
              amount,
              memo,
            );
        const tx = await HiveTxUtils.createTransaction([op]);
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
        result = isDeposit
          ? await SavingsUtils.deposit(
              amount,
              data.to,
              username,
              key!,
              options,
              memo,
            )
          : await SavingsUtils.withdraw(
              amount,
              data.to,
              username,
              key!,
              options,
              memo,
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
    const message = await createMessage(
      err,
      result,
      data,
      request?.tab!,
      await chrome.i18n.getMessage(
        isDeposit
          ? 'popup_html_deposit_success'
          : 'popup_html_withdraw_success',
        [amountLabel],
      ),
      err_message,
    );
    return message;
  }
};
