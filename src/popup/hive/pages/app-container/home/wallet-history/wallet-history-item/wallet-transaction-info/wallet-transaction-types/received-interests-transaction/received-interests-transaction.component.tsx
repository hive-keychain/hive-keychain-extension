import { ReceivedInterests } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface ReceivedInterestsTransactionProps {
  transaction: ReceivedInterests;
}

const ReceivedInterestsTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & ReceivedInterestsTransactionProps) => {
  const getDetail = () => {
    return chrome.i18n.getMessage('popup_html_wallet_info_received_interests', [
      FormatUtils.withCommas(transaction.interest, 3),
    ]);
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

export const ReceivedInterestsTransactionComponent = connector(
  ReceivedInterestsTransaction,
);
