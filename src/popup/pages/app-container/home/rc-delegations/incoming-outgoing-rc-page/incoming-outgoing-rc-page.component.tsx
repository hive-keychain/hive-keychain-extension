import {
  RcDelegation,
  RCDelegationValue,
} from '@interfaces/rc-delegation.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import { RcDelegationsUtils } from 'src/utils/rc-delegations.utils';
import './incoming-outgoing-rc-page.component.scss';

const IncomingOutgoingRcPage = ({
  delegationType,
  delegations,
  globalProperties,
  currencyLabels,
  activeAccount,
  setTitleContainerProperties,
  navigateToWithParams,
  removeFromLoadingList,
  addToLoadingList,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  let header = '';
  switch (delegationType) {
    case DelegationType.INCOMING:
      header = 'popup_html_total_incoming';
      break;
    case DelegationType.OUTGOING:
      header = 'popup_html_total_outgoing';
      break;
  }

  const [totalRC, setTotalRC] = useState<RCDelegationValue>();
  const [delegationList, setDelegationList] = useState<RcDelegation[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: delegationType,
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });

    let totalRC: any = 0;

    if (delegationType === DelegationType.INCOMING) {
      totalRC = delegations.reduce((prev, cur) => {
        return prev + Number(cur.value);
      }, 0);
      setDelegationList(delegations);
    } else if (delegationType === DelegationType.OUTGOING) {
      totalRC = delegations.reduce((prev, cur) => {
        return prev + Number(cur.value);
      }, 0);
      setDelegationList(delegations);
    }

    totalRC = RcDelegationsUtils.rcToGigaRc(totalRC);

    setTotalRC({
      gigaRcValue: totalRC.toString(),
      hpValue: RcDelegationsUtils.gigaRcToHp(totalRC, globalProperties!),
    } as RCDelegationValue);
  }, []);

  const goToEdit = (rcDelegation: RcDelegation) => {
    navigateToWithParams(Screen.RC_DELEGATIONS_PAGE, {
      formParams: rcDelegation,
    });
  };

  const cancelDelegation = async (rcDelegation: RcDelegation) => {
    const fields = [
      {
        label: 'popup_html_rc_delegation_to',
        value: `@${rcDelegation.delegatee}`,
      },
      {
        label: 'popup_html_rc_delegation_value',
        value: `${RcDelegationsUtils.rcToGigaRc(
          Number(rcDelegation.value),
        )} G RC (≈ ${RcDelegationsUtils.rcToHp(
          rcDelegation.value,
          globalProperties,
        )} ${currencyLabels.hp})`,
      },
    ];
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_cancel_rc_delegation_confirm_text',
      ),
      fields: fields,
      title: 'popup_html_cancel_rc_delegation_title',
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_delegate_rc_operation');
        let success;

        success = await RcDelegationsUtils.cancelDelegation(
          rcDelegation.delegatee,
          activeAccount.name!,
          activeAccount.keys.posting!,
        );

        removeFromLoadingList('html_popup_cancel_delegate_rc_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);

          setSuccessMessage('popup_html_cancel_rc_delegation_successful', [
            `@${rcDelegation.delegatee}`,
          ]);
        } else {
          setErrorMessage('popup_html_cancel_rc_delegation_failed');
        }
      },
    });
  };

  return (
    <div
      className="incoming-outgoing-rc-page"
      data-testid={`${Screen.RC_DELEGATIONS_INCOMING_OUTGOING_PAGE}-page`}>
      <div className="list-panel">
        <div className="panel">
          <div className="total">
            <div className="label">{chrome.i18n.getMessage(header)}</div>
            {totalRC && (
              <div className="value">
                <span className="rc-value">
                  {RcDelegationsUtils.formatRcWithUnit(
                    totalRC.gigaRcValue,
                    true,
                  )}
                </span>
                <span className="hp-value">
                  ≈ {totalRC.hpValue} {currencyLabels.hp}
                </span>
              </div>
            )}
            {!totalRC && (
              <div className="value">
                <span>...</span>
              </div>
            )}
          </div>

          <div className="list">
            {delegationList.map((delegation, index) => (
              <div className="item" key={`rcdelegation-${index}`}>
                <div className="username">@{delegation.delegatee}</div>
                <div className="value">
                  <span className="rc-value">
                    {RcDelegationsUtils.formatRcWithUnit(
                      delegation.value,
                      false,
                    )}
                  </span>
                  <span className="hp-value">
                    ≈{' '}
                    {RcDelegationsUtils.rcToHp(
                      delegation.value,
                      globalProperties,
                    )}{' '}
                    {currencyLabels.hp}
                  </span>
                </div>
                <div className="actions">
                  {delegationType === DelegationType.OUTGOING && (
                    <img
                      className="icon edit-delegation"
                      src="/assets/images/edit.png"
                      onClick={() => goToEdit(delegation)}
                    />
                  )}
                  {delegationType === DelegationType.OUTGOING && (
                    <img
                      className="icon erase-delegation"
                      src="/assets/images/clear.png"
                      onClick={() => cancelDelegation(delegation)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    delegationType: state.navigation.stack[0].params
      .delegationType as DelegationType,
    delegations: state.navigation.stack[0].params.delegations as RcDelegation[],
    globalProperties: state.globalProperties,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
  removeFromLoadingList,
  addToLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const IncomingOutgoingRcPageComponent = connector(
  IncomingOutgoingRcPage,
);
