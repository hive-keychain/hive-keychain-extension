import { RecurrentTransfer } from '@interfaces/transaction.interface';
import { GenericTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';

interface RecurrentTransferTransactionProps {
  transaction: RecurrentTransfer;
}

const RecurrentTransferTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & RecurrentTransferTransactionProps) => {
  const getDetail = () => {
    if (parseFloat(transaction.amount.split(' ')[0]) === 0) {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_canceled_recurrent_transfer',
        [transaction.from, transaction.to],
      );
    } else if (activeAccountName === transaction.from) {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_recurrent_transfer_out',
        [
          transaction.amount,
          transaction.to,
          transaction.executions.toString(),
          transaction.recurrence.toString(),
        ],
      );
    } else {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_recurrent_transfer_in',
        [
          transaction.from,
          transaction.amount,
          transaction.executions.toString(),
          transaction.recurrence.toString(),
        ],
      );
    }
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

export const RecurrentTransferTransactionComponent = connector(
  RecurrentTransferTransaction,
);
