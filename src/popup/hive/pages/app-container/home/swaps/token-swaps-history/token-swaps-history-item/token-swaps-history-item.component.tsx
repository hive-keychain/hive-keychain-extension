import { setInfoMessage } from '@popup/hive/actions/message.actions';
import { RootState } from '@popup/hive/store';
import { ISwap, SwapStatus } from 'hive-keychain-commons';
import moment from 'moment';
import { default as React, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import Icon from 'src/common-ui/icon/icon.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import FormatUtils from 'src/utils/format.utils';

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
        return NewIcons.CLOSE;
      case SwapStatus.COMPLETED:
        return NewIcons.CLOSE;
      case SwapStatus.CANCELED_DUE_TO_ERROR:
      case SwapStatus.FUNDS_RETURNED:
      case SwapStatus.REFUNDED_SLIPPAGE:
        return NewIcons.CLOSE;
    }
  };

  const getShortenedId = (id: string) => {
    return id.substring(0, 6) + '...' + id.slice(-6);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return NewIcons.CLOSE;
      case 'pending':
        return NewIcons.CLOSE;
      case 'failed':
        return NewIcons.CLOSE;
      default:
        return NewIcons.CLOSE;
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
        <Icon
          name={!isOpen ? NewIcons.CLOSE : NewIcons.CLOSE}
          additionalClassName={`expand-panel`}
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className="swap-details">
          <div className="from-to">
            {swap.amount} {swap.startToken} <Icon name={NewIcons.CLOSE} />{' '}
            <span>
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
            </span>
          </div>
        </div>
        <CustomTooltip
          position="left"
          delayShow={0}
          skipTranslation
          message={getTooltipMessage(swap)}>
          <Icon name={getStatusIcon(swap.status)} />
        </CustomTooltip>
      </div>

      {isOpen && (
        <>
          <div className="history">
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
