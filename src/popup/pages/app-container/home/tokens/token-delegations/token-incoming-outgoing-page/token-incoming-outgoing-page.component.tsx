import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
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
import { TokenIncomingOutgoingItemComponent } from '@popup/pages/app-container/home/tokens/token-delegations/token-incoming-outgoing-page/token-incoming-outgoing-item.component/token-incoming-outgoing-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import FormatUtils from 'src/utils/format.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import './token-incoming-outgoing-page.component.scss';

const TokenIncomingOutgoingPage = ({
  delegationType,
  tokenBalance,
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const header =
    delegationType === DelegationType.INCOMING
      ? 'popup_html_total_incoming'
      : 'popup_html_total_outgoing';

  const [total, setTotal] = useState<string | number>('...');
  const [delegationList, setDelegationList] = useState<TokenDelegation[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: delegationType,
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    let delegations: TokenDelegation[];

    if (delegationType === DelegationType.INCOMING) {
      delegations = await HiveEngineUtils.getIncomingDelegations(
        tokenBalance.symbol,
        activeAccountName!,
      );
    } else {
      delegations = await HiveEngineUtils.getOutgoingDelegations(
        tokenBalance.symbol,
        activeAccountName!,
      );
    }

    setDelegationList(delegations);

    console.log(delegations);

    const balance =
      delegationType === DelegationType.INCOMING
        ? tokenBalance.delegationsIn
        : tokenBalance.delegationsOut;

    setTotal(
      FormatUtils.withCommas(
        balance,
        FormatUtils.hasMoreThanXDecimal(parseFloat(balance), 3) ? 8 : 3,
      ),
    );
  };

  return (
    <div className="incoming-outgoing-page">
      <div className="total">
        <div className="label">{chrome.i18n.getMessage(header)}</div>
        <div className="value">
          {total} {tokenBalance.symbol}
        </div>
      </div>

      <div className="list">
        {delegationList.map((delegation, index) => (
          <TokenIncomingOutgoingItemComponent
            key={index}
            delegationType={delegationType}
            username={
              delegationType === DelegationType.INCOMING
                ? delegation.from
                : delegation.to
            }
            amount={delegation.quantity}
            symbol={tokenBalance.symbol}
          />
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.activeAccount.name,
    delegationType: state.navigation.stack[0].params
      .delegationType as DelegationType,
    tokenBalance: state.navigation.stack[0].params.tokenBalance as TokenBalance,
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

export const TokenIncomingOutgoingPageComponent = connector(
  TokenIncomingOutgoingPage,
);
