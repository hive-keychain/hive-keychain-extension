import {
  FormatUtils,
  VscHistoryItem as VscHistoryItemType,
  VscHistoryType,
  VscStatus,
  VscUtils,
} from 'hive-keychain-commons';
import moment from 'moment';
import React, { BaseSyntheticEvent, useState } from 'react';
import 'react-tabs/style/react-tabs.scss';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
type Props = {
  transaction: VscHistoryItemType;
  username: string;
};
const VscHistoryItem = ({ transaction, username }: Props) => {
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);
  const hasExpandableContent = !!transaction.memo?.length;
  const toggleExpandableContent = () => {
    if (hasExpandableContent) {
      setExpandablePanelOpened(!isExpandablePanelOpened);
    }
  };

  const getIcon = () => {
    switch (transaction.type) {
      case VscHistoryType.CONTRACT_CALL:
        return SVGIcons.VSC_CALL;
      case VscHistoryType.TRANSFER:
        return SVGIcons.WALLET_SEND;
      case VscHistoryType.DEPOSIT:
        return SVGIcons.WALLET_POWER_UP;
      case VscHistoryType.WITHDRAW:
        return SVGIcons.WALLET_POWER_DOWN;
      case VscHistoryType.STAKING:
        return SVGIcons.WALLET_TOKEN_STAKE;
      case VscHistoryType.UNSTAKING:
        return SVGIcons.WALLET_TOKEN_UNSTAKE;
      default:
        return SVGIcons.WALLET_HIVE_LOGO;
    }
  };

  const openTransactionOnVsc = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    window.open(
      `${Config.vsc.BLOCK_EXPLORER}/${
        transaction.txId.startsWith('bafy') ? 'vsc-tx' : 'tx'
      }/${transaction.txId.split('-')[0]}`,
    );
  };

  const getDetail = () => {
    switch (transaction.type) {
      case VscHistoryType.CONTRACT_CALL:
        // return chrome.i18n.getMessage('popup_html_vsc_info_call', [
        //   transaction.data.action,
        //   FormatUtils.shortenString(transaction.data.contract_id),
        // ]);
        return;

      case VscHistoryType.DEPOSIT:
        if (transaction.from === username && transaction.to === username)
          return chrome.i18n.getMessage('popup_html_vsc_info_deposit', [
            FormatUtils.withCommas(transaction.amount / 1000 + '', 3),
            transaction.asset.toUpperCase(),
          ]);
        else if (transaction.to === username) {
          return chrome.i18n.getMessage('popup_html_vsc_info_deposit_from', [
            VscUtils.getFormattedAddress(transaction.from)!,
            FormatUtils.withCommas(transaction.amount / 1000 + '', 3),
            transaction.asset.toUpperCase(),
          ]);
        }
      case VscHistoryType.WITHDRAW:
        if (transaction.from === username && transaction.to === username)
          return chrome.i18n.getMessage('popup_html_vsc_info_withdraw', [
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
          ]);
        else if (transaction.from === username) {
          return chrome.i18n.getMessage('popup_html_vsc_info_withdraw_to', [
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
            VscUtils.getFormattedAddress(transaction.to)!,
          ]);
        }
      case VscHistoryType.TRANSFER:
        if (transaction.from === username)
          return chrome.i18n.getMessage('popup_html_vsc_info_transfer_to', [
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
            VscUtils.getFormattedAddress(transaction.to)!,
          ]);
        else {
          return chrome.i18n.getMessage('popup_html_vsc_info_transfer_from', [
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
            VscUtils.getFormattedAddress(transaction.from)!,
          ]);
        }
      case VscHistoryType.STAKING:
      case VscHistoryType.UNSTAKING:
        const type =
          transaction.type === VscHistoryType.STAKING ? 'stake' : 'unstake';
        if (transaction.from === username && transaction.to === username)
          return chrome.i18n.getMessage(`popup_html_vsc_info_${type}`, [
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
          ]);
        else if (transaction.to === username) {
          return chrome.i18n.getMessage(`popup_html_vsc_info_${type}_from`, [
            VscUtils.getFormattedAddress(transaction.from)!,
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
          ]);
        } else {
          return chrome.i18n.getMessage(`popup_html_vsc_info_${type}_to`, [
            FormatUtils.withCommas(transaction.amount + '', 3),
            transaction.asset.toUpperCase(),
            VscUtils.getFormattedAddress(transaction.to)!,
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
      case VscStatus.FAILED:
        icon = SVGIcons.SWAPS_STATUS_CANCELED;
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
            hasExpandableContent ? 'has-expandable-content' : ''
          }`}
          key={transaction.txId}
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
              {hasExpandableContent && (
                <SVGIcon
                  icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
                  className={`expand-collapse ${
                    isExpandablePanelOpened ? 'open' : 'closed'
                  }`}
                />
              )}
            </div>
          </div>
          {hasExpandableContent && isExpandablePanelOpened && (
            <div
              className={
                isExpandablePanelOpened
                  ? 'expandable-panel opened'
                  : 'expandable-panel closed'
              }>
              {transaction.memo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const VscHistoryItemComponent = VscHistoryItem;
