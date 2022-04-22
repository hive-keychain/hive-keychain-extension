import {
  DelegationRequest,
  DelegationRequestStatus,
} from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import './delegation-request-item.component.scss';

interface DelegationRequestItemProps {
  delegationRequest: DelegationRequest;
  hideDisplayChip?: boolean;
}

const DelegationRequestItem = ({
  delegationRequest,
  currencyLabels,
  activeAccountName,
  hideDisplayChip,
}: PropsFromRedux) => {
  useEffect(() => {}, []);

  const toggleSupport = () => {
    console.log('try to support ', delegationRequest);
  };

  return (
    <div className={`delegation-request-item ${delegationRequest.status}`}>
      <div className="left-panel">
        <div className="creator">@{delegationRequest.creator}</div>
        <div className="delegation-value">
          {chrome.i18n.getMessage('popup_html_delegation_market_request')} :{' '}
          {delegationRequest.value} {currencyLabels.hp}
        </div>
        <div className="delegation-payout">
          {chrome.i18n.getMessage('popup_html_delegation_market_payout')} :{' '}
          {delegationRequest.dailyPay}{' '}
          {currencyLabels[delegationRequest.currency]}
        </div>
        <div className="delegation-nb-days">
          {chrome.i18n.getMessage('popup_html_delegation_market_duration')} :{' '}
          {delegationRequest.duration / 7}{' '}
          {chrome.i18n.getMessage(
            delegationRequest.duration / 7 > 1 ? 'weeks' : 'week',
          )}
        </div>
      </div>
      <div className="right-panel">
        {!hideDisplayChip && (
          <div className={`status-chip ${delegationRequest.status}`}>
            {chrome.i18n.getMessage(
              `popup_html_delegation_request_status_${delegationRequest.status}`,
            )}
          </div>
        )}
        <div className="button-panel">
          {(!delegationRequest.delegator ||
            delegationRequest.delegator === activeAccountName) &&
            delegationRequest.creator !== activeAccountName &&
            delegationRequest.status !== DelegationRequestStatus.FINISHED && (
              <div
                className="delegate-undelegate-button"
                onClick={toggleSupport}>
                {chrome.i18n.getMessage(
                  delegationRequest.delegator
                    ? 'popup_html_delegation_request_undelegate'
                    : 'popup_html_delegation_request_delegate',
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    activeAccountName: state.activeAccount.name!,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> &
  DelegationRequestItemProps;

export const DelegationRequestItemComponent = connector(DelegationRequestItem);
