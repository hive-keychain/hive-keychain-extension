import { RecurrentTransfer } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';
import FormatUtils from 'src/utils/format.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface RecurrentTransferTransactionProps {
  transaction: RecurrentTransfer;
}

const RecurrentTransferTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & RecurrentTransferTransactionProps) => {
  const getDetail = () => {
    if (parseFloat(transaction.amount.split(' ')[0]) === 0) {
      return I18nUtils.getMessage(
        'popup_html_wallet_info_canceled_recurrent_transfer',
        [transaction.from, transaction.to],
      );
    } else if (activeAccountName === transaction.from) {
      return I18nUtils.getMessage(
        'popup_html_wallet_info_recurrent_transfer_out',
        [
          FormatUtils.withCommas(transaction.amount, 3),
          transaction.to,
          transaction.executions.toString(),
          transaction.recurrence.toString(),
        ],
      );
    } else {
      return I18nUtils.getMessage(
        'popup_html_wallet_info_recurrent_transfer_in',
        [
          transaction.from,
          FormatUtils.withCommas(transaction.amount, 3),
          transaction.executions.toString(),
          transaction.recurrence.toString(),
        ],
      );
    }
  };

  return (
    <GenericTransactionComponent
      transaction={transaction}
      detail={getDetail()}
      expandableContent={transaction.memo}></GenericTransactionComponent>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccountName: state.hive.activeAccount.name };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const RecurrentTransferTransactionComponent = connector(
  RecurrentTransferTransaction,
);
