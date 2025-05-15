import {
  StartWithdrawSavings,
  WithdrawSavings,
} from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface WithdrawSavingsTransactionProps {
  transaction: WithdrawSavings | StartWithdrawSavings;
}

const FillWithdrawSavingsTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & WithdrawSavingsTransactionProps) => {
  const getDetail = () => {
    return chrome.i18n.getMessage(
      'popup_html_wallet_info_fill_withdraw_savings',
      [FormatUtils.withCommas(transaction.amount, 3)],
    );
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

export const FillWithdrawSavingsTransactionComponent = connector(
  FillWithdrawSavingsTransaction,
);
