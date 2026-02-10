import { EscrowTransfer } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import { EscrowHistoryUtils } from 'hive-keychain-commons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface EscrowTransferTransactionProps {
  transaction: EscrowTransfer;
}

const EscrowTransferTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & EscrowTransferTransactionProps) => {
  const { key, params } = EscrowHistoryUtils.getEscrowTransferHistoryMessage(
    activeAccountName!,
    transaction,
  );

  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={chrome.i18n.getMessage(
        `popup_html_${key}`,
        params,
      )}></GenericTransactionComponent>
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
