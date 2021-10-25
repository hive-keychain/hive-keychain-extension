import { Transaction } from '@interfaces/transaction.interface';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './wallet-history-item.component.scss';

interface WalletHistoryItemProps {
  transaction: Transaction;
}

const WalletHistoryItem = ({
  transaction,
  activeAccountName,
}: PropsFromRedux) => {
  const [isMemoOpened, setIsMemoOpened] = useState(false);

  return (
    <div
      className="wallet-history-item"
      onClick={() => setIsMemoOpened(!isMemoOpened)}>
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
            <div className="currency">{transaction.amount.split(' ')[1]}</div>
          </div>
        </div>
        <div
          className={isMemoOpened ? 'memo-panel opened' : 'memo-panel closed'}>
          {transaction.memo}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & WalletHistoryItemProps;

export const WalletHistoryItemComponent = connector(WalletHistoryItem);
