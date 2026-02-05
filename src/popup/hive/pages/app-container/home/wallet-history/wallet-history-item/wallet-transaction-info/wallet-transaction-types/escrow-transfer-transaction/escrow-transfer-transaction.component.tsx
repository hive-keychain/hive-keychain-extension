import { EscrowTransfer } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';
import FormatUtils from 'src/utils/format.utils';

interface EscrowTransferTransactionProps {
  transaction: EscrowTransfer;
}

const EscrowTransferTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & EscrowTransferTransactionProps) => {
  const getEscrowAmount = () => {
    const amounts: string[] = [];
    if (
      transaction.hive_amount &&
      FormatUtils.getValFromString(transaction.hive_amount) > 0
    ) {
      amounts.push(FormatUtils.withCommas(transaction.hive_amount, 3));
    }
    if (
      transaction.hbd_amount &&
      FormatUtils.getValFromString(transaction.hbd_amount) > 0
    ) {
      amounts.push(FormatUtils.withCommas(transaction.hbd_amount, 3));
    }
    if (amounts.length > 0) return amounts.join(' + ');
    const fallback = transaction.hive_amount || transaction.hbd_amount;
    return fallback ? FormatUtils.withCommas(fallback, 3) : '0.000 HIVE';
  };

  const getDetail = () => {
    const amount = getEscrowAmount();
    if (activeAccountName === transaction.from) {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_escrow_transfer_out',
        [amount, transaction.to],
      );
    }
    if (activeAccountName === transaction.to) {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_escrow_transfer_in',
        [amount, transaction.from],
      );
    }
    return chrome.i18n.getMessage(
      'popup_html_wallet_info_escrow_transfer_other',
      [amount, transaction.from, transaction.to],
    );
  };

  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={getDetail()}></GenericTransactionComponent>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccountName: state.hive.activeAccount.name };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EscrowTransferTransactionComponent = connector(
  EscrowTransferTransaction,
);
