import Decimal from 'decimal.js';
import {
  LifiHistoryItem,
  LifiHistoryStatus,
  LifiHistoryTransferSide,
} from 'hive-keychain-commons';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

import { CustomTooltip } from '@common-ui/custom-tooltip/custom-tooltip.component';
import { setInfoMessage } from '@popup/multichain/actions/message.actions';

interface Props {
  historyItem: LifiHistoryItem;
  sendingChainLogoURI: string;
  receivingChainLogoURI: string;
}

const LiFiHistoryItemComponent = ({
  historyItem,
  sendingChainLogoURI,
  receivingChainLogoURI,
  setInfoMessage,
}: PropsFromRedux) => {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'REFUND_IN_PROGRESS':
        return chrome.i18n.getMessage('evm_lifi_swap_refund_in_progress');
      case 'UNKNOWN_ERROR':
        return chrome.i18n.getMessage('evm_lifi_swap_unknown_error');
      case 'WAIT_SOURCE_CONFIRMATIONS':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_wait_source_confirmations',
        );
      case 'WAIT_DESTINATION_TRANSACTION':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_status_wait_target_confirmation',
        );
      case 'BRIDGE_NOT_AVAILABLE':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_status_bridge_not_available',
        );
      case 'CHAIN_NOT_AVAILABLE':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_status_chain_not_available',
        );
      case 'COMPLETED':
        return chrome.i18n.getMessage('evm_lifi_swap_completed');
      case 'PARTIAL':
        return chrome.i18n.getMessage('evm_lifi_swap_partially_completed');
      case 'REFUNDED':
        return chrome.i18n.getMessage('evm_lifi_swap_refunded_completed');
      case 'NOT_PROCESSABLE_REFUND_NEEDED':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_manual_intervention_required',
        );
      case 'OUT_OF_GAS':
        return chrome.i18n.getMessage('evm_lifi_swap_failed_out_of_gas');
      case 'SLIPPAGE_EXCEEDED':
        return chrome.i18n.getMessage('evm_lifi_swap_failed_slippage');
      case 'INSUFFICIENT_ALLOWANCE':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_failed_insufficient_balance',
        );
      case 'INSUFFICIENT_BALANCE':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_failed_insufficient_balance',
        );
      case 'EXPIRED':
        return chrome.i18n.getMessage(
          'evm_lifi_swap_failed_transaction_expired',
        );
      default:
        return chrome.i18n.getMessage('swap_status_pending');
    }
  };

  const getStatusIcon = (status: LifiHistoryStatus) => {
    switch (status) {
      case 'PENDING':
        return SVGIcons.SWAPS_STATUS_PROCESSING;
      case 'DONE':
        if (historyItem.substatus === 'COMPLETED') {
          return SVGIcons.SWAPS_STATUS_FINISHED;
        } else {
          return SVGIcons.SWAPS_STATUS_CANCELED;
        }
      case 'INVALID':
        return SVGIcons.SWAPS_STATUS_CANCELED;
      default:
        return SVGIcons.SWAPS_STATUS_PROCESSING;
    }
  };

  const normalizeAmount = (amount?: string, decimals?: number) => {
    if (!amount) return undefined;
    if (amount.includes('.') || decimals === undefined || decimals < 0) {
      return amount;
    }
    return new Decimal(amount).div(new Decimal(10).pow(decimals)).toString();
  };

  const formatAmount = (side?: LifiHistoryTransferSide) => {
    const amount = normalizeAmount(side?.amount, side?.token?.decimals);
    if (!amount) return '...';
    return FormatUtils.withCommas(amount, 6, true);
  };

  const openExplorerLink = () => {
    if (!historyItem.lifiExplorerLink) return;
    chrome.tabs.create({
      url: historyItem.lifiExplorerLink,
    });
  };

  const sendingSymbol = historyItem.sending?.token?.symbol ?? '';
  const receivingSymbol = historyItem.receiving?.token?.symbol ?? '';

  return (
    <div className="lifi-history-item">
      <div className="lifi-history-item-information">
        <div className="swap-details">
          <div className="swap-item-icon-container">
            <SVGIcon
              icon={SVGIcons.SWAPS_ITEM}
              className="swap-item-icon"
              onClick={openExplorerLink}
            />
          </div>
          <div className="swap-details-content">
            <div className="token token-from">
              <div className="logos">
                <img
                  src={historyItem.sending?.token?.logoURI}
                  className="token-logo"
                />
                <img src={sendingChainLogoURI} className="chain-logo" />
              </div>
              {formatAmount(historyItem.sending)} {sendingSymbol}
            </div>
            <SVGIcon icon={SVGIcons.SWAPS_BETWEEN} className="swap-between" />
            <div className="token token-to">
              {historyItem.status === 'DONE' ? (
                ''
              ) : (
                <span className="approximate">~</span>
              )}
              <div className="logos">
                <img
                  src={historyItem.receiving?.token?.logoURI}
                  className="token-logo"
                />
                <img src={receivingChainLogoURI} className="chain-logo" />
              </div>
              {formatAmount(historyItem.receiving)} {receivingSymbol}
            </div>
          </div>
          <CustomTooltip
            position="left"
            skipTranslation
            message={getStatusMessage(historyItem.substatus!)}
            delayShow={500}>
            <SVGIcon
              icon={getStatusIcon(historyItem.status)}
              className="swap-item-icon"
            />
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};

const connector = connect(null, { setInfoMessage });
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const LiFiHistoryItem = connector(LiFiHistoryItemComponent);
