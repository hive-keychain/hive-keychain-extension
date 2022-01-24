import { Client } from '@hiveio/dhive';
import { Rpc } from '@interfaces/rpc.interface';
import React, { useEffect, useState } from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';
import CurrencyUtils, { BaseCurrencies } from 'src/utils/currency.utils';

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
      const client = new Client(
        rpc.uri === 'DEFAULT' ? 'https://api.hive.blog' : rpc.uri,
        {
          chainId: rpc.testnet ? rpc.chainId : undefined,
        },
      );

      client.database.getAccounts([username]).then((accounts) => {
        const account = accounts[0];
        const currencyParsed = CurrencyUtils.getCurrencyLabel(
          currency,
          rpc.testnet,
        );
        const currentBalance = (
          (cur === BaseCurrencies.HIVE
            ? account.balance
            : account.hbd_balance) as string
        ).split(' ')[0];
        const newBalance = (parseFloat(currentBalance) - amount).toFixed(3);
        setBalance(`${currentBalance} ${currencyParsed}`);
        setNewBalance(`${newBalance} ${currencyParsed}`);
      });
    }
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

export default RequestBalance;
