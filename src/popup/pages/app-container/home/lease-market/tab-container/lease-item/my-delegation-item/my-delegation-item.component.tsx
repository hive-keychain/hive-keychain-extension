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
import {
  Lease,
  LeaseStatus,
} from '@popup/pages/app-container/home/lease-market/lease-market.interface';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import { LeaseMarketUtils } from 'src/utils/lease-market.utils';
import '../lease-item.component.scss';

interface MyDelegationItemProps {
  lease: Lease;
  outgoingDelegations: VestingDelegation[];
}

const MyDelegationItem = ({
  lease,
  outgoingDelegations,
  currencyLabels,
  activeAccount,
  globalProperties,
  navigateToWithParams,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  goBack,
}: PropsFromRedux) => {
  const cancelLease = async () => {
    const [oldDelegation, newDelegation] =
      LeaseMarketUtils.getPreviousAndNewDelegationToUser(
        outgoingDelegations,
        lease,
        lease.status === LeaseStatus.ACTIVE,
      );

    const fields = [
      {
        label: 'popup_html_lease_market_lease_creator',
        value: `@${lease.creator}`,
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

    if (lease.status === LeaseStatus.ACTIVE) {
      navigateToWithParams(Screen.CONFIRMATION_PAGE, {
        message: chrome.i18n.getMessage(
          'popup_html_confirm_undelegate_lease_message',
        ),
        fields: fields,
        title: 'popup_html_confirm_undelegate_lease_title',
        afterConfirmAction: async () => {
          addToLoadingList('popup_html_lease_market_undelegate');
          const success = await LeaseMarketUtils.undelegateLease(
            lease,
            activeAccount,
            newDelegation,
          );
          if (success) {
            setSuccessMessage(
              'popup_html_delegation_request_undelegate_success',
            );
          } else {
            setErrorMessage('popup_html_delegation_request_undelegate_failed');
          }
          removeFromLoadingList('popup_html_lease_market_undelegate');
        },
      });
    }
  };

  return (
    <div className="my-delegation-item lease-item">
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
        <div className="remaining-days">
          {chrome.i18n.getMessage('popup_html_lease_market_remaining_days', [
            lease.remainingPayments.toString(),
          ])}
        </div>
      </div>
      <div className="right-panel">
        <div className={`status-chip ${lease.status}`}>
          {chrome.i18n.getMessage(
            `popup_html_delegation_request_status_${lease.status}`,
          )}
        </div>
        <div className="button-panel">
          {lease.creator !== activeAccount.name! &&
            lease.status === LeaseStatus.ACTIVE && (
              <div className="delegate-undelegate-button" onClick={cancelLease}>
                {chrome.i18n.getMessage(
                  'popup_html_delegation_request_undelegate',
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
    activeAccount: state.activeAccount,
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

export const MyDelegationItemComponent = connector(MyDelegationItem);
