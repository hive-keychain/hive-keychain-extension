import { PowerUp } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';

interface PowerUpTransactionProps {
  transaction: PowerUp;
}

const PowerUpTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & PowerUpTransactionProps) => {
  const getDetail = () => {
    if (transaction.to !== activeAccountName) {
      return chrome.i18n.getMessage(
        'popup_html_wallet_info_power_up_other_account',
        [
          transaction.from,
          FormatUtils.withCommas(transaction.amount, 3),
          transaction.to,
        ],
      );
    }
    return chrome.i18n.getMessage('popup_html_wallet_info_power_up', [
      FormatUtils.withCommas(transaction.amount, 3),
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

export const PowerUpTransactionComponent = connector(PowerUpTransaction);
