import { Transaction } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { WalletTransactionInfoComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-info.component';

interface WalletHistoryItemProps {
  transaction: Transaction;
  ariaLabel?: string;
}

const WalletHistoryItem = ({ transaction, ariaLabel }: PropsFromRedux) => {
  return (
    <div
      data-testid={ariaLabel}
      id={`index-${transaction.index}`}
      className={`wallet-history-item`}>
      <WalletTransactionInfoComponent
        transaction={transaction}></WalletTransactionInfoComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & WalletHistoryItemProps;

export const WalletHistoryItemComponent = connector(WalletHistoryItem);
