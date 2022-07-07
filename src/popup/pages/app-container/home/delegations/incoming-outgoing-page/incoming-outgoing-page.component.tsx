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
import { IncomingOutgoingItemComponent } from '@popup/pages/app-container/home/delegations/incoming-outgoing-page/incoming-outgoing-item.component/incoming-outgoing-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import './incoming-outgoing-page.component.scss';

const IncomingOutgoingPage = ({
  delegationType,
  delegations,
  globalProperties,
  currencyLabels,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const header =
    delegationType === DelegationType.INCOMING
      ? 'popup_html_total_incoming'
      : 'popup_html_total_outgoing';

  const [totalHP, setTotalHP] = useState<string | number>('...');
  const [delegationList, setDelegationList] = useState<any[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: delegationType,
      isBackButtonEnabled: true,
    });

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

  return (
    <div aria-label="incoming-outgoing-page" className="incoming-outgoing-page">
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
            amount={delegation.vesting_shares}></IncomingOutgoingItemComponent>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    delegationType: state.navigation.stack[0].params
      .delegationType as DelegationType,
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
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const IncomingOutgoingPageComponent = connector(IncomingOutgoingPage);
