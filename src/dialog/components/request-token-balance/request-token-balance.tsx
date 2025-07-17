import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import { HiveEngineUtils } from '@popup/hive/utils/hive-engine.utils';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import RequestItem, {
  RequestItemType,
} from 'src/dialog/components/request-item/request-item';
import FormatUtils from 'src/utils/format.utils';

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
    HiveEngineUtils.get<TokenBalance[]>({
      contract: 'tokens',
      table: 'balances',
      query: { account: username },
      indexes: [],
      limit: 1000,
      offset: 0,
    }).then((tokens: any) => {
      const token = tokens.find((e: any) => e.symbol === currency);
      const bal = token ? token.balance : '0';
      const newBal = parseFloat(bal.replace(/,/g, '')) - amount;
      setBalance(
        `${FormatUtils.formatCurrencyValue(bal, precision, true)} ${currency}`,
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
      type={
        balance.length ? RequestItemType.REACT_NODE : RequestItemType.STRING
      }
      content={
        balance.length ? (
          parseFloat(newBalance) < 0 ? (
            <span className="insufficient-balance">
              {chrome.i18n.getMessage('dialog_insufficient_balance')}
            </span>
          ) : (
            <span className="balance-container">
              <span className="balance">{balance}</span>
              <SVGIcon
                icon={SVGIcons.GLOBAL_ARROW_RIGHT}
                className="right-arrow-icon"
              />
              <span className="new-balance">{newBalance}</span>
            </span>
          )
        ) : (
          '...'
        )
      }
    />
  );
};

export default RequestTokenBalance;
