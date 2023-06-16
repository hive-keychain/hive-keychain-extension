import { Swap, SwapStatus } from '@interfaces/swap-token.interface';
import { setInfoMessage } from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import { default as React, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import Icon from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import './token-swaps-history-item.component.scss';

interface Props {
  swap: Swap;
}

const TokenSwapsHistoryItem = ({ swap, setInfoMessage }: PropsFromRedux) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyIdToCliplboard = (id: string) => {
    navigator.clipboard.writeText(id.toString());
    setInfoMessage('swap_copied_to_clipboard');
  };
  const getStatusMessage = (
    status: Swap['status'],
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
      case SwapStatus.REFUNDED_CANNOT_COMPLETE:
        return chrome.i18n.getMessage('swap_status_refunded');
      case SwapStatus.FUNDS_RETURNED:
        return chrome.i18n.getMessage('swap_status_returned');
      case SwapStatus.REFUNDED_SLIPPAGE:
        return chrome.i18n.getMessage('swap_status_refunded');
      case SwapStatus.STARTED:
        return chrome.i18n.getMessage('swap_status_started');
    }
  };

  const getShortenedId = (id: string) => {
    return id.substring(0, 6) + '...' + id.slice(-6);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return Icons.SUCCESS;
      case 'pending':
        return Icons.PENDING;
      case 'failed':
        return Icons.CANCEL;
      default:
        return Icons.PENDING;
    }
  };

  const goToTx = (txId: string) => {
    let url: string = `https://hiveblocks.com/tx/${txId}`;

    chrome.tabs.create({
      url: url,
    });
  };
  return (
    <div className={`history-item`}>
      <div className="history-item-information">
        <Icon
          name={Icons.EXPAND_MORE}
          additionalClassName={`expand-panel`}
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className="swap-details">
          <div className="from-to">
            {swap.amount} {swap.startToken}{' '}
            <Icon name={Icons.ARROW_DOWNWARDS} />{' '}
            <span>
              {swap.status === SwapStatus.COMPLETED ? (
                ''
              ) : (
                <span className="approximate">~</span>
              )}{' '}
              {swap.finalAmount} {swap.endToken}
            </span>
          </div>
        </div>
        <CustomTooltip
          position="left"
          delayShow={0}
          skipTranslation
          message={chrome.i18n.getMessage('swap_last_update', [
            moment(swap.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
          ])}>
          <div className={`chip ${swap.status}`}>
            {getStatusMessage(swap.status, swap.transferInitiated)}
          </div>
        </CustomTooltip>
      </div>

      {isOpen && (
        <>
          <div className="history">
            {swap.history.map((step) => (
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
                  <div
                    className="go-to-tx"
                    onClick={() => goToTx(step.transactionId)}>
                    {chrome.i18n.getMessage('swap_see_transaction')}
                  </div>
                </div>
                <Icon
                  name={getStepIcon(step.status)}
                  additionalClassName={`step-status ${step.status}`}
                />
              </div>
            ))}
            {!!swap.fee && (
              <div className="step">
                <div className="step-number">
                  {chrome.i18n.getMessage('swap_fee')}
                </div>
                <div className="description">
                  {swap.fee} {swap.endToken}
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
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setInfoMessage });
type PropsFromRedux = ConnectedProps<typeof connector> & Props;

export const TokenSwapsHistoryItemComponent = connector(TokenSwapsHistoryItem);
