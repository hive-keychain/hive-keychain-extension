import { FormatUtils, VscUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  amount: number;
  currency: 'hive' | 'hbd' | 'hbd_savings';
  username?: string;
  receiver?: boolean;
};

const RequestVscBalance = ({
  username,
  amount,
  currency,
  receiver = false,
}: Props) => {
  const [balance, setBalance] = useState('');
  const [newBalance, setNewBalance] = useState('');
  useEffect(() => {
    if (username) {
      init(username);
    }
  }, [username]);

  const init = async (username: string) => {
    const accountBalance = await VscUtils.getAccountBalance(username);
    const currentBalance = accountBalance[currency] / 1000;
    const newBalance = FormatUtils.formatCurrencyValue(
      receiver ? currentBalance + amount : currentBalance - amount,
      3,
    );
    const currencyParsed = currency === 'hive' ? 'HIVE' : 'HBD';
    setBalance(`${currentBalance} ${currencyParsed}`);
    setNewBalance(`${newBalance} ${currencyParsed}`);
  };

  return (
    <RequestItem
      title={
        currency === 'hbd_savings'
          ? 'dialog_vsc_savings_balance'
          : 'dialog_vsc_balance'
      }
      red={parseFloat(newBalance) < 0}
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

export default RequestVscBalance;
