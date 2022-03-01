import { Transaction } from '@interfaces/transaction.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import './wallet-history-item.component.scss';

interface WalletHistoryItemProps {
  transaction: Transaction;
}

const WalletHistoryItem = ({
  transaction,
  activeAccountName,
}: PropsFromRedux) => {
  const [isMemoOpened, setIsMemoOpened] = useState(false);

  const getIcon = () => {
    switch (transaction.type) {
      case 'transfer':
        return Icons.SEND;
      default:
        return Icons.LINK;
    }
  };

  const openTransactionOnHiveblocks = () => {
    chrome.windows.create({
      url: `https://hiveblocks.com/tx/${transaction.txId}`,
    });
  };

  return (
    <div
      id={`index-${transaction.index}`}
      className={`wallet-history-item ${transaction.memo ? 'has-memo' : ''}`}>
      <Icon
        name={getIcon()}
        type={IconType.OUTLINED}
        onClick={openTransactionOnHiveblocks}></Icon>
      <div
        className="transaction"
        key={transaction.key}
        onClick={() => setIsMemoOpened(!isMemoOpened)}>
        <div className="information-panel">
          <div className="top-row">
            <div
              className="date"
              data-for={`datetime-tooltip`}
              data-tip={moment(transaction.timestamp).format(
                'YYYY/MM/DD , hh:mm:ss a',
              )}
              data-iscapture="true">
              {moment(transaction.timestamp).format('L')}
            </div>
            <div className="amount">
              {activeAccountName === transaction.from ? '-' : '+'}{' '}
              {FormatUtils.withCommas(transaction.amount.split(' ')[0])}
            </div>
          </div>
          <div className="bottom-row">
            <div className="from-to">
              {chrome.i18n.getMessage(
                activeAccountName === transaction.from
                  ? 'popup_html_transfer_to'
                  : 'popup_html_transfer_from',
              )}
              : @
              {activeAccountName === transaction.from
                ? transaction.to
                : transaction.from}
            </div>
            <div className="currency">{transaction.amount.split(' ')[1]}</div>
          </div>
        </div>
        <div
          className={isMemoOpened ? 'memo-panel opened' : 'memo-panel closed'}>
          {transaction.memo}
        </div>
      </div>
      <ReactTooltip
        id="datetime-tooltip"
        place="top"
        type="light"
        effect="solid"
        multiline={true}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & WalletHistoryItemProps;

export const WalletHistoryItemComponent = connector(WalletHistoryItem);
