import { DepositSavings } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface DepositSavingsTransactionProps {
  transaction: DepositSavings;
}

const DepositSavingsTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & DepositSavingsTransactionProps) => {
  const getDetail = () => {
    if (transaction.to !== activeAccountName) {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_deposit_savings_other_account',
        [
          transaction.from,
          FormatUtils.withCommas(transaction.amount, 3),
          transaction.to,
        ],
      );
    } else {
      return chrome.i18n.getMessage('popup_html_wallet_info_deposit_savings', [
        FormatUtils.withCommas(transaction.amount, 3),
      ]);
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

export const DepositSavingsTransactionComponent = connector(
  DepositSavingsTransaction,
);
