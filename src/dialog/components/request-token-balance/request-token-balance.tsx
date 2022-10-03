import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import React, { useEffect, useState } from 'react';
import Config from 'src/config';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';

type Props = {
  amount: number;
  currency: string;
  username: string;
  hiveEngineConfig: HiveEngineConfig;
};

const RequestTokenBalance = ({
  username,
  amount,
  currency,
  hiveEngineConfig,
}: Props) => {
  const [balance, setBalance] = useState('');
  const [newBalance, setNewBalance] = useState('');
  const config = hiveEngineConfig ? hiveEngineConfig : Config.hiveEngine;
  useEffect(() => {
    HiveEngineConfigUtils.setActiveApi(config.rpc);
    HiveEngineUtils.getUserBalance(username)
      .then((tokens: any) => {
        const token = tokens.find((e: any) => e.symbol === currency);
        const bal = token ? token.balance : '0';
        const newBal = (parseFloat(bal) - amount).toFixed(3);
        setBalance(`${bal} ${currency}`);
        setNewBalance(`${newBal} ${currency}`);
      })
      .catch((e: any) => Logger.error('Issue retrieving user tokens', e));
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
