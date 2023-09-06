import { Transaction } from '@interfaces/transaction.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
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
      case 'savings':
        return Icons.SAVINGS;
      case 'power_up_down': {
        switch (transaction.subType) {
          case 'transfer_to_vesting':
            return Icons.ARROW_UPWARDS;
          case 'withdraw_vesting':
            return Icons.ARROW_DOWNWARDS;
        }
      }
      case 'delegate_vesting_shares':
        return Icons.DELEGATIONS;
      case 'claim_account':
        return Icons.ACCOUNT;
      case 'convert':
        return Icons.CONVERT;
      default:
        return Icons.LINK;
    }
  };

  const openTransactionOnHiveblocks = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    window.open(transaction.url);
  };

  return (
    <div
      data-testid="transaction-expandable-area"
      className={`transaction ${
        expandableContent ? 'has-expandable-content' : ''
      }`}
      key={transaction.key}
      onClick={toggleExpandableContent}>
      <div className="information-panel">
        <div className="top-row">
          <Icon
            dataTestId="icon-open-new-window"
            name={getIcon()}
            type={IconType.OUTLINED}
            onClick={openTransactionOnHiveblocks}></Icon>
          <CustomTooltip
            dataTestId="custom-tool-tip"
            message={moment(transaction.timestamp).format(
              'YYYY/MM/DD , hh:mm:ss a',
            )}
            skipTranslation>
            <div className="date">
              {moment(transaction.timestamp).format('L')}
            </div>
          </CustomTooltip>
          <div className="divider"></div>
          {expandableContent && (
            <Icon
              name={Icons.EXPAND_MORE}
              onClick={() => setExpandablePanelOpened(!isExpandablePanelOpened)}
              additionalClassName={`more ${
                isExpandablePanelOpened ? 'opened' : 'closed'
              }`}
              type={IconType.OUTLINED}></Icon>
          )}
        </div>
        <div className="bottom-row">{detail}</div>
      </div>
      {expandableContent && isExpandablePanelOpened && (
        <div
          className={
            isExpandablePanelOpened
              ? 'expandable-panel opened'
              : 'expandable-panel closed'
          }>
          {expandableContent}
        </div>
      )}
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
