import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { FormatUtils } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { TokenIncomingOutgoingItemComponent } from 'src/popup/hive/pages/app-container/home/tokens/token-delegations/token-incoming-outgoing-page/token-incoming-outgoing-item.component/token-incoming-outgoing-item.component';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';

const TokenIncomingOutgoingPage = ({
  delegationType,
  tokenBalance,
  tokenInfo,
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
      delegations = await TokensUtils.getIncomingDelegations(
        tokenBalance.symbol,
        activeAccountName!,
      );
    } else {
      delegations = await TokensUtils.getOutgoingDelegations(
        tokenBalance.symbol,
        activeAccountName!,
      );
    }

    setDelegationList(delegations);

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
    <div
      data-testid={`${Screen.TOKENS_DELEGATIONS}-page`}
      className="token-incoming-outgoing-page">
      {delegationType === DelegationType.OUTGOING &&
        tokenInfo.undelegationCooldown > 0 && (
          <div className="cooldown-message">
            {chrome.i18n.getMessage(
              'popup_html_token_undelegation_cooldown_disclaimer',
              [tokenInfo.symbol, tokenInfo.undelegationCooldown.toString()],
            )}
          </div>
        )}

      <div className="list-panel">
        <div className="panel">
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
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccountName: state.hive.activeAccount.name,
    delegationType: state.navigation.stack[0].params
      .delegationType as DelegationType,
    tokenBalance: state.navigation.stack[0].params.tokenBalance as TokenBalance,
    tokenInfo: state.navigation.stack[0].params.tokenInfo as Token,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenIncomingOutgoingPageComponent = connector(
  TokenIncomingOutgoingPage,
);
