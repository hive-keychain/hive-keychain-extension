import { Rpc } from '@interfaces/rpc.interface';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyUtils, {
  BaseCurrencies,
} from 'src/popup/hive/utils/currency.utils';

type Props = {
  amount: number;
  currency: string;
  username?: string;
  rpc: Rpc;
};

const RequestBalance = ({ rpc, username, amount, currency }: Props) => {
  const [balance, setBalance] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const cur = currency.toLowerCase();
  useEffect(() => {
    if (username) {
      init(username);
    }
  }, [username]);

  const init = async (username: string) => {
    const account = await AccountUtils.getExtendedAccount(username);
    const currencyParsed = CurrencyUtils.getCurrencyLabel(
      currency,
      rpc.testnet,
    );
    const currentBalance = FormatUtils.formatCurrencyValue(
      (
        (cur === BaseCurrencies.HIVE
          ? account.balance
          : account.hbd_balance) as string
      ).split(' ')[0],
    );
    const newBalance = FormatUtils.formatCurrencyValue(
      parseFloat(currentBalance.replace(/,/g, '')) - amount,
      3,
    );
    setBalance(`${currentBalance} ${currencyParsed}`);
    setNewBalance(`${newBalance} ${currencyParsed}`);
  };

  return (
    <RequestItem
      title="dialog_balance"
      content={
        balance.length
          ? parseFloat(newBalance) < 0
            ? chrome.i18n.getMessage('dialog_insufficient_balance')
            : `${balance} => ${newBalance}`
          : '...'
      }
    />
  );
};

export default RequestBalance;
