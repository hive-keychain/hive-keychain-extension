import { Transaction } from '@interfaces/transaction.interface';
import { WalletTransactionInfoComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-info.component';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
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
      id={`index-${transaction.index}`}
      // className={`wallet-history-item ${/*transaction.memo ? 'has-memo' : ''*/}`}>
      className={`wallet-history-item`}>
      <WalletTransactionInfoComponent
        transaction={transaction}></WalletTransactionInfoComponent>
      <ReactTooltip
        id="datetime-tooltip"
        place="top"
        type="light"
        effect="solid"
        multiline={true}
      />
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
