import { Convert } from '@interfaces/transaction.interface';
import { GenericTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';
import React, { useEffect } from 'react';
import 'react-tabs/style/react-tabs.scss';

interface Props {
  transaction: Convert;
}

export const ConvertTransactionComponent = ({ transaction }: Props) => {
  useEffect;
  const getDetail = () => {
    return chrome.i18n.getMessage('popup_html_wallet_info_convert', [
      transaction.amount,
    ]);
  };
  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={getDetail()}></GenericTransactionComponent>
  );
};
