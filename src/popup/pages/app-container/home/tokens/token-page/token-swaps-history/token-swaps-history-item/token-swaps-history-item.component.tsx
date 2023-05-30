import { Swap, SwapStatus } from '@interfaces/swap-token.interface';
import { setInfoMessage } from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Icon from 'src/common-ui/icon/icon.component';
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
  const getStatusMessage = (status: Swap['status']) => {
    switch (status) {
      case SwapStatus.PENDING:
        return chrome.i18n.getMessage('swap_status_pending');
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
    let url: string = `https://www.hiveblocks.com/tx/${txId}`;

    chrome.tabs.create({
      url: url,
    });
  };

  return (
    <div className={`history-item`}>
      <div className="history-item-information">
        <Icon
          name={Icons.EXPAND_MORE}
          additionalClassName={`expand-panel ${
            swap.history.length === 0 ? 'hidden' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className="swap-details">
          <div className="from-to">
            {swap.amount} {swap.startToken} {'=>'} {swap.estimatedFinalAmount}{' '}
            {swap.endToken}
          </div>
          <div className="id" onClick={() => copyIdToCliplboard(swap.id)}>
            {getShortenedId(swap.id)}
          </div>
        </div>
        <div className={`chip ${swap.status}`}>
          {getStatusMessage(swap.status)}
        </div>
      </div>

      {isOpen && swap.history.length !== 0 && (
        <div className="history">
          {swap.history.map((step) => (
            <div className="step" key={swap.id + '' + step.stepNumber}>
              <div className="step-number">{step.stepNumber}</div>
              <div className="details">
                <div className="description">
                  {step.amountStartToken} {step.startToken} {'=>'}{' '}
                  {step.amountEndToken ? step.amountEndToken : '...'}{' '}
                  {step.endToken}
                </div>
                <div
                  className="go-to-tx"
                  onClick={() => goToTx(step.transactionId)}>
                  See transaction
                </div>
              </div>
              <Icon
                name={getStepIcon(step.status)}
                additionalClassName={`step-status ${step.status}`}
              />
            </div>
          ))}
        </div>
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
