import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  Lease,
  LeaseStatus,
} from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { RootState } from '@popup/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import { DelegationMarketUtils } from 'src/utils/delegation-market.utils';
import './lease-item.component.scss';

interface LeaseItemProps {
  lease: Lease;
  hideDisplayChip?: boolean;
}

const LeaseItem = ({
  lease,
  currencyLabels,
  activeAccount,
  hideDisplayChip,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  useEffect(() => {}, []);

  const toggleSupport = async () => {
    if (lease.status === LeaseStatus.ACTIVE) {
      const success = await DelegationMarketUtils.cancelLeaseRequest(
        lease,
        activeAccount,
      );
      if (success) {
        chrome.i18n.getMessage(
          'popup_html_delegation_request_undelegate_success',
        );
      } else {
        chrome.i18n.getMessage(
          'popup_html_delegation_request_undelegate_failed',
        );
      }
    } else if (lease.status === LeaseStatus.PENDING) {
      const success = await DelegationMarketUtils.acceptLeaseRequest(
        lease,
        activeAccount,
      );
      if (success) {
        chrome.i18n.getMessage('popup_html_delegation_request_accept_success');
      } else {
        chrome.i18n.getMessage('popup_html_delegation_request_accept_failed');
      }
    }
  };

  const cancelLease = async () => {
    if (await DelegationMarketUtils.cancelLeaseRequest(lease, activeAccount)) {
      setSuccessMessage('popup_html_delegation_request_cancel_success');
    } else {
      setErrorMessage('popup_html_delegation_request_cancel_failed');
    }
  };

  return (
    <div className={`lease-item ${lease.status}`}>
      <div className="left-panel">
        <div className="creator">@{lease.creator}</div>
        <div className="delegation-value">
          {chrome.i18n.getMessage('popup_html_delegation_market_request')} :{' '}
          {lease.value} {currencyLabels.hp}
        </div>
        <div className="delegation-payout">
          {chrome.i18n.getMessage('popup_html_delegation_market_payout')} :{' '}
          {lease.dailyPay} {currencyLabels[lease.currency]}
        </div>
        <div className="delegation-nb-days">
          {chrome.i18n.getMessage('popup_html_delegation_market_duration')} :{' '}
          {lease.duration / 7}{' '}
          {chrome.i18n.getMessage(lease.duration / 7 > 1 ? 'weeks' : 'week')}
        </div>
      </div>
      <div className="right-panel">
        {!hideDisplayChip && (
          <div className={`status-chip ${lease.status}`}>
            {chrome.i18n.getMessage(
              `popup_html_delegation_request_status_${lease.status}`,
            )}
          </div>
        )}
        <div className="button-panel">
          {(!lease.delegator || lease.delegator === activeAccount.name!) &&
            lease.creator !== activeAccount.name! &&
            lease.status !== LeaseStatus.FINISHED && (
              <div
                className="delegate-undelegate-button"
                onClick={toggleSupport}>
                {chrome.i18n.getMessage(
                  lease.delegator
                    ? 'popup_html_delegation_request_undelegate'
                    : 'popup_html_delegation_request_delegate',
                )}
              </div>
            )}
          {lease.status === LeaseStatus.PENDING &&
            lease.creator === activeAccount.name && (
              <div className="delegate-undelegate-button" onClick={cancelLease}>
                {chrome.i18n.getMessage('popup_html_delegation_request_cancel')}
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
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector> & LeaseItemProps;

export const LeaseItemComponent = connector(LeaseItem);
