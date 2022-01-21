import React, { useEffect, useState } from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';
import HiveEngineUtils from 'src/utils/hive-engine.utils';

type Props = {
  amount: number;
  currency: string;
  username: string;
};

const RequestTokenBalance = ({ username, amount, currency }: Props) => {
  const [balance, setBalance] = useState('');
  const [newBalance, setNewBalance] = useState('');
  useEffect(() => {
    HiveEngineUtils.getUserBalance(username).then((tokens: any) => {
      const token = tokens.find((e: any) => e.symbol === currency);
      const bal = token ? token.balance : '0';
      const newBal = (parseFloat(bal) - amount).toFixed(3);
      setBalance(`${bal} ${currency}`);
      setNewBalance(`${newBal} ${currency}`);
    });
  }, [username]);
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

export default RequestTokenBalance;
