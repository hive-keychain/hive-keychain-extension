import { VestingDelegation } from '@hiveio/dhive';
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
import { Lease } from '@popup/pages/app-container/home/lease-market/lease-market.interface';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import { LeaseMarketUtils } from 'src/utils/lease-market.utils';
import '../lease-item.component.scss';

interface LeaseMarketItemProps {
  lease: Lease;
  outgoingDelegations: VestingDelegation[];
  canDelegate: boolean;
}

const LeaseMarketItem = ({
  lease,
  outgoingDelegations,
  canDelegate,
  globalProperties,
  currencyLabels,
  activeAccount,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  goBack,
}: PropsFromRedux) => {
  const delegate = async () => {
    const [oldDelegation, newDelegation] =
      LeaseMarketUtils.getPreviousAndNewDelegationToUser(
        outgoingDelegations,
        lease,
        false,
      );
    const fields = [
      {
        label: 'popup_html_lease_market_lease_creator',
        value: `@${lease.creator}`,
      },
      {
        label: 'popup_html_lease_market_daily_payout',
        value: `${FormatUtils.formatCurrencyValue(
          lease.dailyPay,
          3,
        )} ${lease.currency.toUpperCase()}`,
      },
      {
        label: 'popup_html_lease_market_duration',
        value: `${lease.duration / 7} ${chrome.i18n.getMessage(
          lease.duration / 7 > 1 ? 'weeks' : 'week',
        )}`,
      },
      {
        label: 'popup_html_lease_value',
        value: `${FormatUtils.formatCurrencyValue(
          FormatUtils.toHP(lease.value.toString(), globalProperties.globals),
        )} ${currencyLabels.hp}`,
      },
    ];
    if (oldDelegation !== 0) {
      fields.push({
        label: 'popup_html_current_delegation',
        value: `${FormatUtils.formatCurrencyValue(
          FormatUtils.toHP(oldDelegation.toString(), globalProperties.globals),
        )} ${currencyLabels.hp}`,
      });
      fields.push({
        label: 'popup_html_new_delegation',
        value: `${FormatUtils.formatCurrencyValue(
          FormatUtils.toHP(newDelegation.toString(), globalProperties.globals),
        )} ${currencyLabels.hp}`,
      });
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_delegation_lease_accept_message',
      ),
      fields: fields,
      title: 'popup_html_confirm_delegation_lease_accept_title',
      afterConfirmAction: async () => {
        addToLoadingList('popup_html_lease_market_delegate_to_user');
        const success = await LeaseMarketUtils.acceptLeaseRequest(
          lease,
          activeAccount,
          newDelegation,
        );
        if (success) {
          setSuccessMessage('popup_html_delegation_request_accept_success');
        } else {
          setErrorMessage('popup_html_delegation_request_accept_failed');
        }
        removeFromLoadingList('popup_html_lease_market_delegate_to_user');
        goBack();
      },
    });
  };

  return (
    <div className="lease-market-item lease-item">
      <div className="left-panel">
        <div className="creator">@{lease.creator}</div>
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
        <div className="delegation-payout">
          {chrome.i18n.getMessage('popup_html_lease_market_daily_payout')} :{' '}
          {FormatUtils.withCommas(lease.dailyPay)}{' '}
          {currencyLabels[lease.currency]}
        </div>
        <div className="delegation-nb-days">
          {chrome.i18n.getMessage('popup_html_lease_market_duration')} :{' '}
          {lease.duration / 7}{' '}
          {chrome.i18n.getMessage(lease.duration / 7 > 1 ? 'weeks' : 'week')}
        </div>
      </div>
      <div className="right-panel">
        <div className="button-panel">
          <div className="delegate-undelegate-button" onClick={delegate}>
            {chrome.i18n.getMessage('popup_html_delegation_request_delegate')}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    globalProperties: state.globalProperties,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector> & LeaseMarketItemProps;

export const LeaseMarketItemComponent = connector(LeaseMarketItem);
