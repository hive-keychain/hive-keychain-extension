import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { WalletHistoryItemComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-history-item.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import './wallet-history.component.scss';

const WalletHistory = ({ transactions, activeAccountName }: PropsFromRedux) => {
  return (
    <div className="wallet-history-page">
      <PageTitleComponent
        title="popup_html_wallet_history"
        isBackButtonEnabled={true}
      />

      <div className="page-content">
        {transactions.list.map((transaction: Transaction) => (
          <WalletHistoryItemComponent
            key={transaction.key}
            transaction={transaction}></WalletHistoryItemComponent>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    transactions: state.transactions as Transactions,
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletHistoryComponent = connector(WalletHistory);
