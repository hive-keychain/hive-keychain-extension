import {
  RecurrentTransferOperation,
  Transaction,
  TransferOperation,
} from '@hiveio/dhive';
import { Key } from '@interfaces/keys.interface';
import { exchanges } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { SavingOperationType } from '@popup/pages/app-container/home/savings/savings-operation-type.enum';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

const getTransferFromToSavingsValidationWarning = (
  account: string,
  operation: SavingOperationType,
) => {
  if (exchanges.map((exchange) => exchange.username).includes(account)) {
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

const getExchangeValidationWarning = async (
  account: string,
  currency: string,
  hasMemo: any,
  isRecurrent?: boolean,
) => {
  const exchange = exchanges.find((exchange) => exchange.username === account);
  if (!exchange) return null;
  if (!exchange.acceptedCoins.includes(currency)) {
    return chrome.i18n.getMessage('popup_warning_exchange_deposit', [currency]);
  }
  if (!hasMemo) return chrome.i18n.getMessage('popup_warning_exchange_memo');
  if (isRecurrent)
    return chrome.i18n.getMessage(
      'popup_html_transfer_recurrent_exchange_warning',
    );
  // if (exchange.account === 'bittrex') {
  //   const info = await CurrencyPricesUtils.getBittrexCurrency(currency);
  //   if (info && !info.IsActive) {
  //     return chrome.i18n.getMessage('popup_warning_exchange_wallet');
  //   }
  // }
  return null;
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
) => {
  if (!recurrent) {
    return HiveTxUtils.sendOperation(
      [getTransferOperation(sender, receiver, amount, memo)],
      activeKey,
      true,
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
  getExchangeValidationWarning,
  getTransferFromToSavingsValidationWarning,
  sendTransfer,
  getTransferOperation,
  getRecurrentTransferOperation,
  getTransferTransaction,
};

export default TransferUtils;
