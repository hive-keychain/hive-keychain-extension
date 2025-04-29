import { Transaction } from '@interfaces/transaction.interface';
import { RootState } from '@popup/multichain/store';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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
        return SVGIcons.WALLET_HISTORY_TRANSFER;
      case 'claim_reward_balance':
        return SVGIcons.WALLET_HISTORY_CLAIM_REWARDS;
      case 'savings':
        return SVGIcons.WALLET_HISTORY_SAVINGS;
      case 'power_up_down': {
        switch (transaction.subType) {
          case 'transfer_to_vesting':
            return SVGIcons.WALLET_HISTORY_POWER_UP;
          case 'withdraw_vesting':
            return SVGIcons.WALLET_HISTORY_POWER_DOWN;
        }
      }
      case 'delegate_vesting_shares':
        return SVGIcons.WALLET_HISTORY_HP_DELEGATIONS;
      case 'claim_account':
        return SVGIcons.WALLET_HISTORY_CLAIM_ACCOUNT;
      case 'convert':
        return SVGIcons.WALLET_HISTORY_CONVERT;
      default:
        return SVGIcons.WALLET_HIVE_LOGO;
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
        <SVGIcon
          className="operation-icon"
          icon={getIcon()}
          onClick={openTransactionOnHiveblocks}
        />
        <div className="right-panel">
          <div className="detail">{detail}</div>
          <CustomTooltip
            dataTestId="scustom-tool-tip"
            additionalClassName="history-tooltip"
            message={moment(transaction.timestamp + 'Z').format(
              'YYYY/MM/DD , hh:mm:ss a',
            )}
            skipTranslation
            color="grey">
            <div className="date">
              {moment(transaction.timestamp + 'Z').format('L')}
            </div>
          </CustomTooltip>
          {expandableContent && (
            <SVGIcon
              icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
              className={`expand-collapse ${
                isExpandablePanelOpened ? 'open' : 'closed'
              }`}
            />
          )}
        </div>
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
