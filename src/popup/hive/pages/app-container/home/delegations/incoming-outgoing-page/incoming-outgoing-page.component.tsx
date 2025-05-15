import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { IncomingOutgoingItemComponent } from 'src/popup/hive/pages/app-container/home/delegations/incoming-outgoing-page/incoming-outgoing-item.component/incoming-outgoing-item.component';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';

const IncomingOutgoingPage = ({
  delegationType,
  delegations,
  globalProperties,
  currencyLabels,
  totalPendingOutgoingUndelegation,
  available,
  setTitleContainerProperties,
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

  const [totalHP, setTotalHP] = useState<string | number>('...');
  const [delegationList, setDelegationList] = useState<any[]>([]);
  const [pendingUndelegationsList, setPendingList] = useState<any[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: delegationType,
      isBackButtonEnabled: true,
    });

    let totalVests = 0;
    let totalPendingOutgoingUndelegation = 0;

    setPendingList(delegations.pendingOutgoingUndelegation);

    if (delegationType === DelegationType.INCOMING) {
      totalVests = delegations.incoming.reduce((prev, cur) => {
        return (
          prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
        );
      }, 0);
      setDelegationList(delegations.incoming);
    } else if (delegationType === DelegationType.OUTGOING) {
      totalVests = delegations.outgoing.reduce((prev, cur) => {
        return (
          prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
        );
      }, 0);
      totalPendingOutgoingUndelegation =
        delegations.pendingOutgoingUndelegation.reduce(
          (prev: any, cur: any) => {
            return prev + cur.vesting_shares;
          },
          0,
        );
      setDelegationList(delegations.outgoing);
    }

    setTotalHP(FormatUtils.toHP(totalVests.toString(), globalProperties));
  }, [delegations]);

  return (
    <div
      className="incoming-outgoing-page"
      data-testid={`${Screen.INCOMING_OUTGOING_PAGE}-page`}>
      {delegationType === DelegationType.OUTGOING &&
        totalPendingOutgoingUndelegation > 0 && (
          <div className="pending-disclaimer">
            {chrome.i18n.getMessage(
              'popup_html_undelegation_pending_until_message',
            )}
          </div>
        )}
      <div className="list-panel">
        {delegationType === DelegationType.OUTGOING &&
          totalPendingOutgoingUndelegation > 0 && (
            <div className="panel pending-undelegations">
              <div className="total">
                <div className="label">
                  {chrome.i18n.getMessage(
                    'popup_html_total_pending_undelegate',
                  )}
                </div>
                <div className="value">
                  {FormatUtils.withCommas(
                    totalPendingOutgoingUndelegation.toString(),
                  )}{' '}
                  {currencyLabels.hp}
                </div>
              </div>

              <div className="list">
                {pendingUndelegationsList.map((pendingUndelegation, index) => (
                  <IncomingOutgoingItemComponent
                    key={index}
                    delegationType={delegationType}
                    amount={pendingUndelegation.vesting_shares.toString()}
                    expirationDate={
                      pendingUndelegation.expiration_date
                    }></IncomingOutgoingItemComponent>
                ))}
              </div>
            </div>
          )}
        <div className="panel">
          <div className="total">
            <div className="label">{chrome.i18n.getMessage(header)}</div>
            <div className="value">
              {FormatUtils.withCommas(totalHP.toString())} {currencyLabels.hp}
            </div>
          </div>

          <div className="list">
            {delegationList.map((delegation, index) => (
              <IncomingOutgoingItemComponent
                key={index}
                delegationType={delegationType}
                username={
                  delegationType === DelegationType.INCOMING
                    ? delegation.delegator
                    : delegation.delegatee
                }
                amount={delegation.vesting_shares}
                expirationDate={delegation.expiration_date}
                maxAvailable={available}></IncomingOutgoingItemComponent>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    delegationType: state.navigation.stack[0].params
      .delegationType as DelegationType,
    totalPendingOutgoingUndelegation:
      state.navigation.stack[0].params.totalPendingOutgoingUndelegation,
    delegations: state.hive.delegations,
    globalProperties: state.hive.globalProperties.globals,
    currencyLabels: CurrencyUtils.getCurrencyLabels(
      state.hive.activeRpc?.testnet!,
    ),
    available: state.navigation.stack[0].params.available,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const IncomingOutgoingPageComponent = connector(IncomingOutgoingPage);
