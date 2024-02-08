import {
  RcDelegation,
  RCDelegationValue,
} from '@interfaces/rc-delegation.interface';
import { RcIncomingOutgoingItemComponent } from '@popup/hive/pages/app-container/home/rc-delegations/incoming-outgoing-rc-page/incoming-outgoing-rc-delegation-item.component';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from 'src/popup/hive/store';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { RcDelegationsUtils } from 'src/popup/hive/utils/rc-delegations.utils';

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
            {delegationList.map(
              (delegation, index) => (
                <RcIncomingOutgoingItemComponent
                  key={`delegation-${index}`}
                  amount={delegation.value}
                  rcDelegation={delegation}
                  delegationType={
                    delegation.delegator === activeAccount.name
                      ? DelegationType.OUTGOING
                      : DelegationType.INCOMING
                  }
                  username={
                    delegation.delegator === activeAccount.name
                      ? delegation.delegatee
                      : delegation.delegator
                  }
                />
              ),
              // <div className="delegation-row">
              //   <div className="item" key={`rcdelegation-${index}`}>
              //     <div className="username">@{delegation.delegatee}</div>

              //     <div className="item-details">
              //       <div className="value">
              //         <span className="rc-value">
              //           {RcDelegationsUtils.formatRcWithUnit(
              //             delegation.value,
              //             false,
              //           )}
              //         </span>
              //         <span className="hp-value">
              //           ≈{' '}
              //           {RcDelegationsUtils.rcToHp(
              //             delegation.value,
              //             globalProperties,
              //           )}{' '}
              //           {currencyLabels.hp}
              //         </span>
              //       </div>
              //       {delegationType !== DelegationType.INCOMING && (
              //         <SVGIcon
              //           icon={NewIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
              //           className={`expand-collapse-icon ${
              //             isExpanded ? 'open' : 'closed'
              //           }`}
              //           onClick={() => setIsExpanded(!isExpanded)}
              //         />
              //       )}
              //     </div>
              //   </div>
              // </div>
            )}
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
