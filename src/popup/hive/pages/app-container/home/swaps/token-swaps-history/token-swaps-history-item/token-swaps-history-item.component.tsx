import { setInfoMessage } from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import { FormatUtils, ISwap, SwapStatus } from 'hive-keychain-commons';
import moment from 'moment';
import { default as React, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  swap: ISwap;
}

const TokenSwapsHistoryItem = ({ swap, setInfoMessage }: PropsFromRedux) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyIdToCliplboard = (id: string) => {
    navigator.clipboard.writeText(id.toString());
    setInfoMessage('swap_copied_to_clipboard');
  };
  const getStatusMessage = (
    status: ISwap['status'],
    transferInitiated: boolean,
  ) => {
    switch (status) {
      case SwapStatus.PENDING:
        return transferInitiated
          ? chrome.i18n.getMessage('swap_status_pending')
          : chrome.i18n.getMessage('swap_transfer_not_sent');
      case SwapStatus.COMPLETED:
        return chrome.i18n.getMessage('swap_status_completed');
      case SwapStatus.CANCELED_DUE_TO_ERROR:
        return chrome.i18n.getMessage('swap_status_canceled_due_to_error');
      case SwapStatus.FUNDS_RETURNED:
        return chrome.i18n.getMessage('swap_status_returned');
      case SwapStatus.REFUNDED_SLIPPAGE:
        return chrome.i18n.getMessage('swap_status_refunded');
      case SwapStatus.STARTED:
        return chrome.i18n.getMessage('swap_status_started');
    }
  };

  const getStatusIcon = (status: ISwap['status']) => {
    switch (status) {
      case SwapStatus.PENDING:
      case SwapStatus.STARTED:
        return SVGIcons.SWAPS_STATUS_PROCESSING;
      case SwapStatus.COMPLETED:
        return SVGIcons.SWAPS_STATUS_FINISHED;
      case SwapStatus.CANCELED_DUE_TO_ERROR:
      case SwapStatus.FUNDS_RETURNED:
      case SwapStatus.REFUNDED_SLIPPAGE:
        return SVGIcons.SWAPS_STATUS_CANCELED;
    }
  };

  const getShortenedId = (id: string) => {
    return id.substring(0, 6) + '...' + id.slice(-6);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return SVGIcons.SWAPS_STATUS_FINISHED;
      case 'pending':
        return SVGIcons.SWAPS_STATUS_PROCESSING;
      case 'failed':
        return SVGIcons.SWAPS_STATUS_CANCELED;
      default:
        return SVGIcons.SWAPS_STATUS_PROCESSING;
    }
  };

  function getTooltipMessage(swap: ISwap) {
    return `${getStatusMessage(swap.status, swap.transferInitiated)}
      <br/> ${
        [SwapStatus.PENDING, SwapStatus.STARTED].includes(swap.status)
          ? chrome.i18n.getMessage('swap_last_update', [
              moment(swap.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
            ])
          : moment(swap.updatedAt).format('YYYY-MM-DD HH:mm:ss')
      }`;
  }

  return (
    <div className={`history-item`}>
      <div className="history-item-information">
        <div className="swap-details">
          <div className="swap-item-icon-container">
            <SVGIcon icon={SVGIcons.SWAPS_ITEM} className="swap-item-icon" />
          </div>
          <span className="token token-from">
            {swap.amount} {swap.startToken}
          </span>{' '}
          <SVGIcon icon={SVGIcons.SWAPS_BETWEEN} className="swap-between" />{' '}
          <div className="token token-to">
            {swap.status === SwapStatus.COMPLETED ? (
              ''
            ) : (
              <span className="approximate">~</span>
            )}{' '}
            {swap.received ??
              FormatUtils.withCommas(
                Number(swap.expectedAmountAfterFee).toString(),
                3,
                true,
              )}{' '}
            {swap.endToken}
          </div>
          <SVGIcon
            icon={SVGIcons.SWAPS_EXPAND}
            className={`expand-panel ${isOpen ? 'opened' : 'closed'}`}
            onClick={() => setIsOpen(!isOpen)}
          />
          <CustomTooltip
            position="left"
            skipTranslation
            message={getTooltipMessage(swap)}>
            <SVGIcon
              icon={getStatusIcon(swap.status)}
              className="status-icon"
            />
          </CustomTooltip>
        </div>
        {isOpen && (
          <div className="swap-item-history">
            {swap.history
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((step) => (
                <div className="step" key={swap.id + '' + step.stepNumber}>
                  <div className="step-number">{step.stepNumber}</div>
                  <div className="details">
                    <div className="description">
                      {FormatUtils.withCommas(
                        step.amountStartToken + '',
                        3,
                        true,
                      )}{' '}
                      {step.startToken} {'=>'}{' '}
                      {step.amountEndToken
                        ? FormatUtils.withCommas(
                            step.amountEndToken + '',
                            3,
                            true,
                          )
                        : '...'}{' '}
                      {step.endToken}
                    </div>
                  </div>
                  <SVGIcon
                    icon={getStepIcon(step.status)}
                    className={`step-status ${step.status}`}
                  />
                </div>
              ))}
            {!!swap.fee && (
              <div className="step">
                <div className="step-number">
                  {chrome.i18n.getMessage('swap_fee')}
                </div>{' '}
                <div className="details">
                  <div className="description">
                    {swap.fee} {swap.endToken}
                  </div>
                </div>
              </div>
            )}
            <div className="step">
              <div className="step-number">ID</div>
              <div className="id" onClick={() => copyIdToCliplboard(swap.id)}>
                {getShortenedId(swap.id)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setInfoMessage });
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const TokenSwapsHistoryItemComponent = connector(TokenSwapsHistoryItem);
