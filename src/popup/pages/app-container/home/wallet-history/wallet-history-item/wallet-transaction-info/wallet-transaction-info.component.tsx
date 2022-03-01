import {
  ClaimReward,
  Transaction,
  Transfer,
} from '@interfaces/transaction.interface';
import { ClaimRewardsTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/claim-rewards-transaction/claim-rewards-transaction.component';
import { TransferTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/transfer-transaction/transfer-transaction.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import './wallet-transaction-info.component.scss';

interface WalletTransactionInfoProps {
  transaction: Transaction;
}

const WalletTransactionInfo = ({
  transaction,
}: PropsFromRedux & WalletTransactionInfoProps) => {
  const getTransactionContent = () => {
    switch (transaction.type) {
      case 'transfer':
        return (
          <TransferTransactionComponent transaction={transaction as Transfer} />
        );
      case 'claim_reward_balance':
        return (
          <ClaimRewardsTransactionComponent
            transaction={transaction as ClaimReward}
          />
        );
    }
  };
  return (
    <div className="wallet-transaction-info">{getTransactionContent()}</div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletTransactionInfoComponent = connector(WalletTransactionInfo);
