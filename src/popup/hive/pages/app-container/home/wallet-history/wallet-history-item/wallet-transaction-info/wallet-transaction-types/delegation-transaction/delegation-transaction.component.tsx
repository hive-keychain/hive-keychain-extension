import { Delegation } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface DelegationTransactionProps {
  transaction: Delegation;
}

const DelegationTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & DelegationTransactionProps) => {
  const getDetail = () => {
    if (activeAccountName === transaction.delegator) {
      if (parseFloat(transaction.amount.split(' ')[0]) === 0) {
        return chrome.i18n.getMessage(
          'popup_html_wallet_info_cancel_delegation_out',
          [transaction.delegatee],
        );
      } else {
        return chrome.i18n.getMessage('popup_html_wallet_info_delegation_out', [
          FormatUtils.withCommas(transaction.amount, 3),
          transaction.delegatee,
        ]);
      }
    } else {
      if (parseFloat(transaction.amount.split(' ')[0]) === 0) {
        return chrome.i18n.getMessage(
          'popup_html_wallet_info_cancel_delegation_in',
          [transaction.delegator],
        );
      } else {
        return chrome.i18n.getMessage('popup_html_wallet_info_delegation_in', [
          transaction.delegator,
          transaction.amount,
        ]);
      }
    }
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

export const DelegationTransactionComponent = connector(DelegationTransaction);
