import {
  VscCall,
  VscHistoryType,
  VscLedgerType,
  VscStatus,
  VscTransfer,
  VscUtils,
} from 'hive-keychain-commons';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import 'react-tabs/style/react-tabs.scss';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import FormatUtils from 'src/utils/format.utils';
type Props = {
  transaction: VscTransfer | VscCall;
};
const VscHistoryItem = ({ transaction }: Props) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);
  let expandableContent = false;

  const toggleExpandableContent = () => {
    if (expandableContent) {
      setExpandablePanelOpened(!isExpandablePanelOpened);
    }
  };

  const getIcon = () => {
    switch (transaction.type) {
      case VscHistoryType.CONTRACT_CALL:
        return SVGIcons.VSC_CALL;
      case VscHistoryType.TRANSFER:
        return transaction.t === VscLedgerType.DEPOSIT
          ? SVGIcons.WALLET_HISTORY_POWER_UP
          : SVGIcons.WALLET_HISTORY_POWER_DOWN;
      default:
        return SVGIcons.WALLET_HIVE_LOGO;
    }
  };

  const openTransactionOnVsc = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    window.open(
      `${Config.vsc.BLOCK_EXPLORER}/${
        transaction.id.startsWith('bafy') ? 'vsc-tx' : 'tx'
      }/${transaction.id.split('-')[0]}`,
    );
  };

  const getDetail = () => {
    switch (transaction.type) {
      case VscHistoryType.CONTRACT_CALL:
        return chrome.i18n.getMessage('popup_html_vsc_info_call', [
          transaction.data.action,
          FormatUtils.shortenString(transaction.data.contract_id),
        ]);

      case VscHistoryType.TRANSFER:
        if (transaction.t === VscLedgerType.DEPOSIT) {
          return chrome.i18n.getMessage('popup_html_vsc_info_deposit', [
            FormatUtils.withCommas(transaction.amount / 1000 + '', 3),
            FormatUtils.shortenString(transaction.tk, 4),
            FormatUtils.shortenString(
              VscUtils.getAddressFromDid(transaction.owner)!,
              4,
            ),
          ]);
        } else {
          return chrome.i18n.getMessage('popup_html_vsc_info_withdraw', [
            FormatUtils.withCommas(transaction.amount / 1000 + '', 3),
            FormatUtils.shortenString(transaction.tk, 4),
            VscUtils.getAddressFromDid(transaction.owner)!,
          ]);
        }
      default:
        return;
    }
  };

  const getStatusIcon = () => {
    let icon;
    switch (transaction.status) {
      case VscStatus.CONFIRMED:
        icon = SVGIcons.SWAPS_STATUS_FINISHED;
        break;
      default:
        icon = SVGIcons.SWAPS_STATUS_PROCESSING;
    }
    return (
      <CustomTooltip
        dataTestId="scustom-tool-tip"
        additionalClassName="history-tooltip"
        message={transaction.status}
        skipTranslation
        color="grey">
        <SVGIcon icon={icon} className={`expand-collapse`} />
      </CustomTooltip>
    );
  };

  return (
    <div className="vsc-history-item">
      <div className="vsc-transaction-info">
        <div
          data-testid="transaction-expandable-area"
          className={`transaction ${
            expandableContent ? 'has-expandable-content' : ''
          }`}
          key={transaction.id}
          onClick={toggleExpandableContent}>
          <div className="information-panel">
            <SVGIcon
              className={`operation-icon `}
              icon={getIcon()}
              onClick={
                transaction.status === VscStatus.CONFIRMED
                  ? openTransactionOnVsc
                  : undefined
              }
            />
            <div className="right-panel">
              <div className="detail">{getDetail()}</div>
              <CustomTooltip
                dataTestId="scustom-tool-tip"
                additionalClassName="history-tooltip"
                message={moment(transaction.timestamp).format(
                  'YYYY/MM/DD , hh:mm:ss a',
                )}
                skipTranslation
                color="grey">
                <div className="date">
                  {moment(transaction.timestamp).format('L')}
                </div>
              </CustomTooltip>
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VscHistoryItemComponent = VscHistoryItem;
