import { RecurrentTransferOperation, TransferOperation } from '@hiveio/dhive';
import { SavingOperationType } from '@popup/pages/app-container/home/savings/savings-operation-type.enum';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const exchanges = [
  { account: 'bittrex', tokens: ['HIVE', 'HBD'] },
  { account: 'deepcrypto8', tokens: ['HIVE'] },
  { account: 'binance-hot', tokens: [] },
  { account: 'ionomy', tokens: ['HIVE', 'HBD'] },
  { account: 'huobi-pro', tokens: ['HIVE'] },
  { account: 'huobi-withdrawal', tokens: [] },
  { account: 'blocktrades', tokens: ['HIVE', 'HBD'] },
  { account: 'mxchive', tokens: ['HIVE'] },
  { account: 'hot.dunamu', tokens: [] },
  { account: 'probithive', tokens: ['HIVE'] },
  { account: 'probitred', tokens: [] },
  { account: 'upbitsteem', tokens: [] },
];

const getTransferFromToSavingsValidationWarning = (
  account: string,
  operation: SavingOperationType,
) => {
  if (exchanges.map((exchange) => exchange.account).includes(account)) {
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
  const exchange = exchanges.find((exchange) => exchange.account === account);
  if (!exchange) return null;
  if (!exchange.tokens.includes(currency)) {
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

const saveFavoriteUser = async (
  username: string,
  activeAccount: ActiveAccount,
) => {
  let transferTo = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
  );
  if (!transferTo) {
    transferTo = { [activeAccount.name!]: [] };
  }
  if (!transferTo[activeAccount.name!]) {
    transferTo[activeAccount.name!] = [];
  }

  if (!transferTo[activeAccount.name!].includes(username)) {
    transferTo[activeAccount.name!].push(username);
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
    transferTo,
  );
};

const sendTransfer = (
  sender: string,
  receiver: string,
  amount: string,
  memo: string,
  recurrent: boolean,
  iterations: number,
  frequency: number,
  activeAccount: ActiveAccount,
) => {
  if (!recurrent) {
    return HiveTxUtils.sendOperation(
      [getTransferOperation(sender, receiver, amount, memo)],
      activeAccount.keys.active!,
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
      activeAccount.keys.active!,
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
    { from: sender, to: receiver, amount: amount, memo: memo },
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

const TransferUtils = {
  getExchangeValidationWarning,
  saveFavoriteUser,
  getTransferFromToSavingsValidationWarning,
  sendTransfer,
  getTransferOperation,
  getRecurrentTransferOperation,
};

export default TransferUtils;
