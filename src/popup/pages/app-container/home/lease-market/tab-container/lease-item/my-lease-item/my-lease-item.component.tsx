import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  goBack,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import {
  Lease,
  LeaseStatus,
} from '@popup/pages/app-container/home/lease-market/lease-market.interface';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import '../lease-item.component.scss';

interface MyDelegationItemProps {
  lease: Lease;
}

const MyLeaseItem = ({
  lease,
  globalProperties,
  currencyLabels,
}: PropsFromRedux) => {
  return (
    <div className="my-lease-item lease-item">
      <div className="left-panel">
        {lease.delegator && (
          <div className="delegator">
            {chrome.i18n.getMessage('popup_html_lease_market_delegation_from', [
              lease.delegator,
            ])}
          </div>
        )}
        <div className="delegation-value">
          {chrome.i18n.getMessage('popup_html_lease_market_request')} :{' '}
          {FormatUtils.withCommas(
            FormatUtils.toHP(
              lease.value.toString(),
              globalProperties.globals,
            ).toString(),
            0,
          )}{' '}
          {currencyLabels.hp}
        </div>
        {lease.remainingPayments > 0 && lease.status === LeaseStatus.ACTIVE && (
          <div className="remaining-days">
            {chrome.i18n.getMessage('popup_html_lease_market_remaining_days', [
              lease.remainingPayments.toString(),
            ])}
          </div>
        )}
        <div className="total-amount">
          {`${chrome.i18n.getMessage(
            'popup_html_lease_market_total_amount',
          )}: ${lease.totalAmount} ${lease.currency.toUpperCase()}`}
        </div>
      </div>
      <div className="right-panel">
        <div className={`status-chip ${lease.status}`}>
          {chrome.i18n.getMessage(
            `popup_html_delegation_request_status_${lease.status}`,
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  navigateToWithParams,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector> & MyDelegationItemProps;

export const MyLeaseItemComponent = connector(MyLeaseItem);
