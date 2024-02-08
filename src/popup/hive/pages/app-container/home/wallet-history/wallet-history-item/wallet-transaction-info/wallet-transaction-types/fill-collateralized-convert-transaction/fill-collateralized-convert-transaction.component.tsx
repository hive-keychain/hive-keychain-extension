import { FillCollateralizedConvert } from '@interfaces/transaction.interface';
import React, { useEffect } from 'react';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface Props {
  transaction: FillCollateralizedConvert;
}

export const FillCollateralizedConvertTransactionComponent = ({
  transaction,
}: Props) => {
  useEffect;
  const getDetail = () => {
    return chrome.i18n.getMessage(
      'popup_html_wallet_info_fill_collateralized_convert_request',
      [transaction.amount_in, transaction.amount_out],
    );
  };
  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={getDetail()}></GenericTransactionComponent>
  );
};
