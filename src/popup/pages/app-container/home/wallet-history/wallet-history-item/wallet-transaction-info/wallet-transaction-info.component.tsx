import {
  ClaimAccount,
  ClaimReward,
  Delegation,
  DepositSavings,
  FillRecurrentTransfer,
  PowerDown,
  PowerUp,
  ReceivedInterests,
  RecurrentTransfer,
  Transaction,
  Transfer,
  WithdrawSavings,
} from '@interfaces/transaction.interface';
import { ClaimAccountTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/claim-account-transaction/claim-account-transaction.component';
import { ClaimRewardsTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/claim-rewards-transaction/claim-rewards-transaction.component';
import { DelegationTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/delegation-transaction/delegation-transaction.component';
import { DepositSavingsTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/deposit-savings-transaction/deposit-savings-transaction.component';
import { FillRecurrentTransferTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/fill-recurrent-transfer-transaction/fill-recurrent-transfer-transaction.component';
import { PowerDownTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/power-down-transaction/power-down-transaction.component';
import { PowerUpTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/power-up-transaction/power-up-transaction.component';
import { ReceivedInterestsTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/received-interests-transaction/received-interests-transaction.component';
import { RecurrentTransferTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/recurrent-transfer-transaction/recurrent-transfer-transaction.component';
import { TransferTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/transfer-transaction/transfer-transaction.component';
import { WithdrawSavingsTransactionComponent } from '@popup/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/withdraw-savings-transaction/withdraw-savings-transaction.component';
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
      case 'recurrent_transfer':
        return (
          <RecurrentTransferTransactionComponent
            transaction={transaction as RecurrentTransfer}
          />
        );
      case 'fill_recurrent_transfer':
        return (
          <FillRecurrentTransferTransactionComponent
            transaction={transaction as FillRecurrentTransfer}
          />
        );
      case 'claim_reward_balance':
        return (
          <ClaimRewardsTransactionComponent
            transaction={transaction as ClaimReward}
          />
        );
      case 'delegate_vesting_shares':
        return (
          <DelegationTransactionComponent
            transaction={transaction as Delegation}
          />
        );
      case 'claim_account':
        return (
          <ClaimAccountTransactionComponent
            transaction={transaction as ClaimAccount}
          />
        );
      case 'interest':
        return (
          <ReceivedInterestsTransactionComponent
            transaction={transaction as ReceivedInterests}
          />
        );
      case 'transfer_to_savings':
        return (
          <DepositSavingsTransactionComponent
            transaction={transaction as DepositSavings}
          />
        );
      case 'transfer_from_savings':
        return (
          <WithdrawSavingsTransactionComponent
            transaction={transaction as WithdrawSavings}
          />
        );
      case 'withdraw_vesting':
        return (
          <PowerDownTransactionComponent
            transaction={transaction as PowerDown}
          />
        );
      case 'transfer_to_vesting':
        return (
          <PowerUpTransactionComponent transaction={transaction as PowerUp} />
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
