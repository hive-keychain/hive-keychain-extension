import {
  EvmTokenHistoryItem,
  EvmTokenHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import moment from 'moment';
import React, { useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface EvmTokenHistoryItemProps {
  historyItem: EvmTokenHistoryItem;
  expandableContent?: string;
}

export const EvmTokenHistoryItemComponent = ({
  historyItem,
  expandableContent,
}: EvmTokenHistoryItemProps) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);

  const toggleExpandableContent = () => {
    if (expandableContent) {
      setExpandablePanelOpened(!isExpandablePanelOpened);
    }
  };

  const getIcon = () => {
    switch (historyItem.type) {
      case EvmTokenHistoryItemType.TRANSFER_IN:
      case EvmTokenHistoryItemType.TRANSFER_OUT:
        return SVGIcons.WALLET_HISTORY_TRANSFER;
      default:
        return SVGIcons.WALLET_HIVE_LOGO;
    }
  };

  return (
    <div className="wallet-history-item">
      <div className="wallet-transaction-info">
        <div
          data-testid="transaction-expandable-area"
          className={`transaction ${
            expandableContent ? 'has-expandable-content' : ''
          }`}
          key={historyItem.transactionHash}
          onClick={toggleExpandableContent}>
          <div className="information-panel">
            <SVGIcon
              className="operation-icon"
              icon={getIcon()}
              onClick={() => console.log('click on icon')}
            />
            <div className="right-panel">
              <div className="detail">
                {chrome.i18n.getMessage('popup_html_wallet_info_claim_account')}
              </div>
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
