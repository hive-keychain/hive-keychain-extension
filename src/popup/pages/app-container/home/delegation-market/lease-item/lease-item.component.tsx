import { VestingDelegation } from '@hiveio/dhive';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import {
  Lease,
  LeaseStatus,
} from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import { DelegationMarketUtils } from 'src/utils/delegation-market.utils';
import FormatUtils from 'src/utils/format.utils';
import './lease-item.component.scss';

interface LeaseItemProps {
  lease: Lease;
  canDelegate: boolean;
  outgoingDelegations: VestingDelegation[];
  hideDisplayChip?: boolean;
}

const LeaseItem = ({
  lease,
  currencyLabels,
  activeAccount,
  hideDisplayChip,
  globalProperties,
  canDelegate,
  outgoingDelegations,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  navigateToWithParams,
}: PropsFromRedux) => {
  const toggleSupport = async () => {
    const [oldDelegation, newDelegation] =
      DelegationMarketUtils.getPreviousAndNewDelegationToUser(
        outgoingDelegations,
        lease,
        lease.status === LeaseStatus.ACTIVE,
      );

    const fields = [
      {
        label: 'popup_html_delegation_market_lease_creator',
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
          const success = await DelegationMarketUtils.undelegateLease(
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
    } else if (lease.status === LeaseStatus.PENDING) {
      if (!canDelegate) {
        setErrorMessage('popup_html_delegation_market_unsuficient_hp_balance');
        return;
      }

      fields.splice(
        1,
        0,
        {
          label: 'popup_html_delegation_market_daily_payout',
          value: `${FormatUtils.formatCurrencyValue(
            lease.dailyPay,
            3,
          )} ${lease.currency.toUpperCase()}`,
        },
        {
          label: 'popup_html_delegation_market_duration',
          value: `${lease.duration / 7} ${chrome.i18n.getMessage(
            lease.duration / 7 > 1 ? 'weeks' : 'week',
          )}`,
        },
      );

      navigateToWithParams(Screen.CONFIRMATION_PAGE, {
        message: chrome.i18n.getMessage(
          'popup_html_confirm_delegation_lease_accept_message',
        ),
        fields: fields,
        title: 'popup_html_confirm_delegation_lease_accept_title',
        afterConfirmAction: async () => {
          addToLoadingList('popup_html_lease_market_delegate_to_user');
          const success = await DelegationMarketUtils.acceptLeaseRequest(
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
        },
      });
    }
  };

  const cancelLease = async () => {
    addToLoadingList('popup_html_lease_market_cancel_request');
    if (await DelegationMarketUtils.cancelLeaseRequest(lease, activeAccount)) {
      setSuccessMessage('popup_html_delegation_request_cancel_success');
    } else {
      setErrorMessage('popup_html_delegation_request_cancel_failed');
    }
    removeFromLoadingList('popup_html_lease_market_cancel_request');
  };

  return (
    <div className={`lease-item ${lease.status}`}>
      <div className="left-panel">
        <div className="creator">@{lease.creator}</div>
        <div className="delegation-value">
          {chrome.i18n.getMessage('popup_html_delegation_market_request')} :{' '}
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
          {chrome.i18n.getMessage('popup_html_delegation_market_daily_payout')}{' '}
          : {FormatUtils.withCommas(lease.dailyPay)}{' '}
          {currencyLabels[lease.currency]}
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
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> & LeaseItemProps;

export const LeaseItemComponent = connector(LeaseItem);
