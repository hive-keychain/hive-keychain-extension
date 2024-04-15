import { ClaimReward } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface ClaimRewardsTransactionProps {
  transaction: ClaimReward;
}

const ClaimRewardsTransaction = ({
  transaction,
}: PropsFromRedux & ClaimRewardsTransactionProps) => {
  const getDetail = () => {
    const rewards = [transaction.hbd, transaction.hive, transaction.hp];
    return chrome.i18n.getMessage('popup_html_wallet_info_claim_rewards', [
      rewards
        .filter(
          (resource) => parseFloat(resource.toString().split(' ')[0]) !== 0,
        )
        .join(' '),
    ]);
  };

  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={getDetail()}></GenericTransactionComponent>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ClaimRewardsTransactionComponent = connector(
  ClaimRewardsTransaction,
);
