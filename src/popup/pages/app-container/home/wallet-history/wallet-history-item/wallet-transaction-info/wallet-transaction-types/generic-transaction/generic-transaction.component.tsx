import { Transaction } from '@interfaces/transaction.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import './generic-transaction.component.scss';

interface GenericTransactionProps {
  transaction: Transaction;
  detail: string;
  expandableContent?: string;
}

const GenericTransaction = ({
  transaction,
  expandableContent,
  detail,
}: PropsFromRedux) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);

  const toggleExpandableContent = () => {
    if (expandableContent) {
      setExpandablePanelOpened(!isExpandablePanelOpened);
    }
  };

  const getIcon = () => {
    switch (transaction.type) {
      case 'transfer':
      case 'recurrent_transfer':
      case 'fill_recurrent_transfer':
        return Icons.SEND;
      case 'claim_reward_balance':
        return Icons.CLAIM;
      default:
        return Icons.LINK;
    }
  };

  const openTransactionOnHiveblocks = (event: BaseSyntheticEvent) => {
    console.log(event.stopPropagation());
    chrome.windows.create({
      url: transaction.url,
    });
  };

  return (
    <div
      className="transaction"
      key={transaction.key}
      onClick={toggleExpandableContent}>
      <div className="information-panel">
        <div className="top-row">
          <Icon
            name={getIcon()}
            type={IconType.OUTLINED}
            onClick={openTransactionOnHiveblocks}></Icon>
          <div
            className="date"
            data-for={`datetime-tooltip`}
            data-tip={moment(transaction.timestamp).format(
              'YYYY/MM/DD , hh:mm:ss a',
            )}
            data-iscapture="true">
            {moment(transaction.timestamp).format('L')}
          </div>
        </div>
        <div className="bottom-row">{detail}</div>
      </div>
      <div
        className={
          isExpandablePanelOpened
            ? 'expandable-panel opened'
            : 'expandable-panel closed'
        }>
        {expandableContent}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  GenericTransactionProps;

export const GenericTransactionComponent = connector(GenericTransaction);
