import { Rpc } from '@interfaces/rpc.interface';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import RequestItem, {
  RequestItemType,
} from 'src/dialog/components/request-item/request-item';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyUtils, {
  BaseCurrencies,
} from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';

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
      type={
        !balance.length ? RequestItemType.STRING : RequestItemType.REACT_NODE
      }
      content={
        balance.length ? (
          parseFloat(newBalance) < 0 ? (
            <span className="insufficient-balance">
              {chrome.i18n.getMessage('dialog_insufficient_balance')}
            </span>
          ) : (
            <span className="balance-container">
              {balance}
              <SVGIcon
                icon={SVGIcons.GLOBAL_ARROW_RIGHT}
                className="right-arrow-icon"
              />
              {newBalance}
            </span>
          )
        ) : (
          '...'
        )
      }
    />
  );
};

export default RequestBalance;
