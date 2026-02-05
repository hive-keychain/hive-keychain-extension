import { EscrowApprove } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface EscrowApproveTransactionProps {
  transaction: EscrowApprove;
}

const EscrowApproveTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & EscrowApproveTransactionProps) => {
  const getDetail = () => {
    const escrowId = `${transaction.escrow_id}`;
    const isSelf = activeAccountName === transaction.who;
    if (transaction.approve) {
      return chrome.i18n.getMessage(
        isSelf
          ? 'popup_html_wallet_info_escrow_approve_self'
          : 'popup_html_wallet_info_escrow_approve_other',
        isSelf ? [escrowId] : [transaction.who, escrowId],
      );
    }
    return chrome.i18n.getMessage(
      isSelf
        ? 'popup_html_wallet_info_escrow_reject_self'
        : 'popup_html_wallet_info_escrow_reject_other',
      isSelf ? [escrowId] : [transaction.who, escrowId],
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

export const EscrowApproveTransactionComponent = connector(
  EscrowApproveTransaction,
);
