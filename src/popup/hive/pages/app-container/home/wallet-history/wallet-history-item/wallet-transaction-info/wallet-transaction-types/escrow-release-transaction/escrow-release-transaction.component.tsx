import { EscrowRelease } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { GenericTransactionComponent } from 'src/popup/hive/pages/app-container/home/wallet-history/wallet-history-item/wallet-transaction-info/wallet-transaction-types/generic-transaction/generic-transaction.component';
import FormatUtils from 'src/utils/format.utils';

interface EscrowReleaseTransactionProps {
  transaction: EscrowRelease;
}

const EscrowReleaseTransaction = ({
  transaction,
  activeAccountName,
}: PropsFromRedux & EscrowReleaseTransactionProps) => {
  const getEscrowAmount = () => {
    const amounts: string[] = [];
    if (
      transaction.hive_amount &&
      FormatUtils.getValFromString(transaction.hive_amount) > 0
    ) {
      amounts.push(FormatUtils.withCommas(transaction.hive_amount, 3));
    }
    if (
      transaction.hbd_amount &&
      FormatUtils.getValFromString(transaction.hbd_amount) > 0
    ) {
      amounts.push(FormatUtils.withCommas(transaction.hbd_amount, 3));
    }
    if (amounts.length > 0) return amounts.join(' + ');
    const fallback = transaction.hive_amount || transaction.hbd_amount;
    return fallback ? FormatUtils.withCommas(fallback, 3) : '0.000 HIVE';
  };

  const getDetail = () => {
    const amount = getEscrowAmount();
    const escrowId = `${transaction.escrow_id}`;
    const isSelf = activeAccountName === transaction.who;
    return chrome.i18n.getMessage(
      isSelf
        ? 'popup_html_wallet_info_escrow_release_self'
        : 'popup_html_wallet_info_escrow_release_other',
      isSelf
        ? [amount, transaction.receiver, escrowId]
        : [transaction.who, amount, transaction.receiver, escrowId],
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

export const EscrowReleaseTransactionComponent = connector(
  EscrowReleaseTransaction,
);
