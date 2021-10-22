import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { RootState } from '@popup/store';
import moment from 'moment';
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
          <div className="transaction" key={transaction.key}>
            <div className="information-panel">
              <div className="top-row">
                <div className="date">
                  {moment(transaction.timestamp).format('L')}
                </div>
                <div className="amount">
                  {activeAccountName === transaction.from ? '-' : '+'}{' '}
                  {transaction.amount.split(' ')[0]}
                </div>
              </div>
              <div className="bottom-row">
                <div className="from-to">
                  {chrome.i18n.getMessage(
                    activeAccountName === transaction.from
                      ? 'popup_html_transfer_to'
                      : 'popup_html_transfer_from',
                  )}
                  : @
                  {activeAccountName === transaction.from
                    ? transaction.to
                    : transaction.from}
                </div>
                <div className="currency">
                  {transaction.amount.split(' ')[1]}
                </div>
              </div>
            </div>
            <div className="memo-panel">{transaction.memo}</div>
          </div>
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
