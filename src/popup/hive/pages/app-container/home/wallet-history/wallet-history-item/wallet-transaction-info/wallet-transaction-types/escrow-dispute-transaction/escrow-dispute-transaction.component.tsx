import { EscrowDispute } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface EscrowDisputeTransactionProps {
  transaction: EscrowDispute;
}

const EscrowDisputeTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & EscrowDisputeTransactionProps) => {
  const getDetail = () => {
    const escrowId = `${transaction.escrow_id}`;
    const isSelf = activeAccountName === transaction.who;
    return chrome.i18n.getMessage(
      isSelf
        ? 'popup_html_wallet_info_escrow_dispute_self'
        : 'popup_html_wallet_info_escrow_dispute_other',
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

export const EscrowDisputeTransactionComponent = connector(
  EscrowDisputeTransaction,
);
