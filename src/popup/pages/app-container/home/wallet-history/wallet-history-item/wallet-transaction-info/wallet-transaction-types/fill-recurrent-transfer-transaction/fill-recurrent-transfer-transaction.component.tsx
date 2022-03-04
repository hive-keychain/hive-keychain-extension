import { FillRecurrentTransfer } from '@interfaces/transaction.interface';
import { GenericTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';

interface FillRecurrentTransferTransactionProps {
  transaction: FillRecurrentTransfer;
}

const FillRecurrentTransferTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & FillRecurrentTransferTransactionProps) => {
  const getDetail = () => {
    return chrome.i18n.getMessage(
      activeAccountName === transaction.from
        ? 'popup_html_wallet_info_fill_recurrent_transfer_out'
        : 'popup_html_wallet_info_fill_recurrent_transfer_in',
      [
        transaction.amount,
        activeAccountName === transaction.from
          ? transaction.to
          : transaction.from,
        transaction.remainingExecutions.toString(),
      ],
    );
  };

  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={getDetail()}
      expandableContent={transaction.memo}></GenericTransactionComponent>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccountName: state.activeAccount.name };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const FillRecurrentTransferTransactionComponent = connector(
  FillRecurrentTransferTransaction,
);
