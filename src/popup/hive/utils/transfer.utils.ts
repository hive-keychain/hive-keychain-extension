import type {
  RecurrentTransferOperation,
  Transaction,
  TransferOperation,
} from '@hiveio/dhive';
import { Key, TransactionOptions } from '@interfaces/keys.interface';
import {
  ExchangesUtils,
  TransferUtils as TransferUtilsCommons,
  TransferWarning,
} from 'hive-keychain-commons';
import { SavingOperationType } from 'src/popup/hive/pages/app-container/home/savings/savings-operation-type.enum';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

const getTransferWarningLabel = (
  account: string,
  currency: string,
  memo: any,
  phisingAccounts: any,
  isRecurrent?: boolean,
) => {
  const warning = TransferUtilsCommons.getTransferWarning(
    account,
    currency,
    memo,
    phisingAccounts,
    isRecurrent,
  );
  switch (warning) {
    case TransferWarning.PHISHING:
      return chrome.i18n.getMessage('popup_warning_phishing', [account]);
    case TransferWarning.EXCHANGE_MEMO:
      return chrome.i18n.getMessage('popup_warning_exchange_memo');
    case TransferWarning.EXCHANGE_RECURRENT:
      return chrome.i18n.getMessage(
        'popup_html_transfer_recurrent_exchange_warning',
      );
    case TransferWarning.EXCHANGE_DEPOSIT:
      return chrome.i18n.getMessage('popup_warning_exchange_deposit', [
        currency,
      ]);
    case TransferWarning.PRIVATE_KEY_IN_MEMO:
      return chrome.i18n.getMessage('popup_warning_private_key_in_memo');
    default:
      return;
  }
};
const getTransferFromToSavingsValidationWarning = (
  account: string,
  operation: SavingOperationType,
) => {
  if (
    ExchangesUtils.getExchanges()
      .map((exchange) => exchange.username)
      .includes(account)
  ) {
    if (operation === SavingOperationType.DEPOSIT) {
      return chrome.i18n.getMessage(
        'popup_html_transfer_to_saving_to_exchange_error',
      );
    } else {
      return chrome.i18n.getMessage(
        'popup_html_transfer_from_saving_to_exchange_error',
      );
    }
  }
};

const sendTransfer = (
  sender: string,
  receiver: string,
  amount: string,
  memo: string,
  recurrent: boolean,
  iterations: number,
  frequency: number,
  activeKey: Key,
  options?: TransactionOptions,
) => {
  if (!recurrent) {
    return HiveTxUtils.sendOperation(
      [getTransferOperation(sender, receiver, amount, memo)],
      activeKey,
      true,
      options,
    );
  } else {
    return HiveTxUtils.sendOperation(
      [
        getRecurrentTransferOperation(
          sender,
          receiver,
          amount,
          memo,
          frequency,
          iterations,
        ),
      ],
      activeKey,
      true,
      options,
    );
  }
};

const getTransferOperation = (
  sender: string,
  receiver: string,
  amount: string,
  memo: string,
) => {
  return [
    'transfer',
    {
      from: sender,
      to: receiver,
      amount: amount,
      memo: memo,
    },
  ] as TransferOperation;
};

const getRecurrentTransferOperation = (
  sender: string,
  receiver: string,
  amount: string,
  memo: string,
  frequency: number,
  iterations: number,
) => {
  return [
    'recurrent_transfer',
    {
      from: sender,
      to: receiver,
      amount: amount,
      memo: memo,
      recurrence: frequency,
      executions: iterations,
      extensions: [],
    },
  ] as RecurrentTransferOperation;
};

const getTransferTransaction = (
  sender: string,
  receiver: string,
  amount: string,
  memo: string,
  recurrent: boolean,
  iterations: number,
  frequency: number,
): Promise<Transaction> => {
  if (!recurrent) {
    return HiveTxUtils.createTransaction([
      getTransferOperation(sender, receiver, amount, memo),
    ]);
  } else {
    return HiveTxUtils.createTransaction([
      getRecurrentTransferOperation(
        sender,
        receiver,
        amount,
        memo,
        frequency,
        iterations,
      ),
    ]);
  }
};

const TransferUtils = {
  getTransferFromToSavingsValidationWarning,
  sendTransfer,
  getTransferOperation,
  getRecurrentTransferOperation,
  getTransferTransaction,
  getTransferWarningLabel,
};

export default TransferUtils;
