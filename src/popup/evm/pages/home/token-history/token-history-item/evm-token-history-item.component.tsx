import { Badge, BadgeType } from '@common-ui/badge/badge.component';
import {
  EvmUserHistoryItem,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface EvmTokenHistoryItemProps {
  historyItem: EvmUserHistoryItem;
  chain: Chain;
  goToDetailsPage: () => void;
  index: number;
  hasDetails?: boolean;
}

export const EvmTokenHistoryItemComponent = ({
  historyItem,
  chain,
  index,
  goToDetailsPage,
  hasDetails = true,
}: EvmTokenHistoryItemProps) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);
  const [expandableContent, setExpandableContent] = useState(
    historyItem.details,
  );

  const toggleExpandableContent = () => {
    if (expandableContent) {
      setExpandablePanelOpened(!isExpandablePanelOpened);
    }
  };

  const getIcon = () => {
    switch (historyItem.type) {
      case EvmUserHistoryItemType.TRANSFER_IN:
      case EvmUserHistoryItemType.TRANSFER_OUT:
        return SVGIcons.WALLET_HISTORY_TRANSFER;
      case EvmUserHistoryItemType.SMART_CONTRACT_CREATION:
        return SVGIcons.EVM_SMART_CONTRACT_CREATION;
      case EvmUserHistoryItemType.SMART_CONTRACT:
        return SVGIcons.EVM_SMART_CONTRACT;
      case EvmUserHistoryItemType.BASE_TRANSACTION:
        return SVGIcons.EVM_BASE_TRANSACTION;
      default:
        return SVGIcons.EVM_BASE_TRANSACTION;
    }
  };

  const goToBlockchainExplorer = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    window.open(
      `${chain.blockExplorer?.url}/tx/${historyItem.transactionHash}`,
    );
  };

  return (
    <div
      className="wallet-history-item"
      onClick={goToDetailsPage}
      key={`${historyItem.transactionHash}-${historyItem.type}`}>
      <div className="wallet-transaction-info">
        <div
          data-testid="transaction-expandable-area"
          className={`transaction ${
            expandableContent ? 'has-expandable-content' : ''
          }`}
          onClick={toggleExpandableContent}>
          <div className="information-panel">
            <SVGIcon
              className="operation-icon"
              icon={getIcon()}
              onClick={goToBlockchainExplorer}
            />
            <div className={`right-panel ${hasDetails ? 'has-details' : ''}`}>
              <div className="detail">
                {index} -{historyItem.label}
              </div>
              {!historyItem.isPending && (
                <CustomTooltip
                  dataTestId="scustom-tool-tip"
                  additionalClassName="history-tooltip"
                  message={moment(historyItem.timestamp).format(
                    'YYYY/MM/DD , hh:mm:ss a',
                  )}
                  skipTranslation
                  color="grey">
                  <div className="date">
                    {moment(historyItem.timestamp).format('L')}
                  </div>
                </CustomTooltip>
              )}
              {historyItem.isPending && (
                <Badge badgeType={BadgeType.PENDING} inverted />
              )}
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
      </div>
    </div>
  );
};
