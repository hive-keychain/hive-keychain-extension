import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import React, { useEffect, useState } from 'react';
import Config from 'src/config';
import RequestItem from 'src/dialog/components/request-item/request-item';
import FormatUtils from 'src/utils/format.utils';
import SSC from 'sscjs';

type Props = {
  amount: number;
  currency: string;
  username: string;
  hiveEngineConfig: HiveEngineConfig;
  precision?: number;
};

const RequestTokenBalance = ({
  username,
  amount,
  currency,
  hiveEngineConfig,
  precision,
}: Props) => {
  const [balance, setBalance] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const config = hiveEngineConfig ? hiveEngineConfig : Config.hiveEngine;
  useEffect(() => {
    new SSC(config.rpc)
      .find('tokens', 'balances', {
        account: username,
      })
      .then((tokens: any) => {
        const token = tokens.find((e: any) => e.symbol === currency);
        const bal = token ? token.balance : '0';
        const newBal = parseFloat(bal.replace(/,/g, '')) - amount;
        setBalance(
          `${FormatUtils.formatCurrencyValue(
            bal,
            precision,
            true,
          )} ${currency}`,
        );
        setNewBalance(
          `${FormatUtils.formatCurrencyValue(
            newBal,
            precision,
            true,
          )} ${currency}`,
        );
      });
  }, [username, precision]);

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
