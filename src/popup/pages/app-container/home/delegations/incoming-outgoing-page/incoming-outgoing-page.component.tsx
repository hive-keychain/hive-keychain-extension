import { VestingDelegation } from '@hiveio/dhive';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './incoming-outgoing-page.component.scss';

const IncomingOutgoingPage = ({
  delegationType,
  delegations,
  globalProperties,
  currencyLabels,
  activeAccount,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const header =
    delegationType === DelegationType.INCOMING
      ? 'popup_html_total_incoming'
      : 'popup_html_total_outgoing';

  const [totalHP, setTotalHP] = useState<string | number>('...');
  const [delegationList, setDelegationList] = useState<any[]>([]);

  useEffect(() => {
    let totalVests = 0;

    if (delegationType === DelegationType.INCOMING) {
      totalVests = delegations.incoming.reduce((prev, cur) => {
        return (
          prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
        );
      }, 0);
      setDelegationList(delegations.incoming);
    } else {
      totalVests = delegations.outgoing.reduce((prev, cur) => {
        return (
          prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
        );
      }, 0);
      setDelegationList(delegations.outgoing);
    }

    setTotalHP(FormatUtils.toHP(totalVests.toString(), globalProperties));
  }, []);

  const cancelDelegation = (delegation: VestingDelegation) => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      fields: [
        {
          label: 'popup_html_operation',
          value: 'popup_html_cancel_delegation',
        },
      ],
      afterConfirmAction: async () => {
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          delegation.delegatee,
          '0.000000 VESTS',
        );

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_power_up_down_success', [
            'popup_html_cancel_delegation',
          ]);
        } else {
          setErrorMessage('popup_html_power_up_down_fail', [
            'popup_html_cancel_delegation',
          ]);
        }
      },
    });
  };

  return (
    <div className="incoming-outgoing-page">
      <PageTitleComponent title={delegationType} isBackButtonEnabled={true} />

      <div className="total">
        <div className="label">{chrome.i18n.getMessage(header)}</div>
        <div className="value">
          {FormatUtils.withCommas(totalHP.toString())} {currencyLabels.hp}
        </div>
      </div>

      <div className="list">
        {delegationList.map((delegation, index) => (
          <div className="delegation-row" key={index}>
            <div className="to-from">
              {delegationType === DelegationType.INCOMING
                ? delegation.delegator
                : delegation.delegatee}
            </div>
            <div className="right-panel">
              <div className="value">
                {FormatUtils.withCommas(
                  FormatUtils.toHP(
                    delegation.vesting_shares.toString().replace(' VESTS', ''),
                    globalProperties,
                  ).toString(),
                )}
              </div>
              {delegationType === DelegationType.OUTGOING && (
                <img
                  className="icon edit-delegation"
                  src="/assets/images/edit.png"
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
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    delegationType: state.navigation.params.delegationType as DelegationType,
    delegations: state.delegations,
    globalProperties: state.globalProperties.globals,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const IncomingOutgoingPageComponent = connector(IncomingOutgoingPage);
