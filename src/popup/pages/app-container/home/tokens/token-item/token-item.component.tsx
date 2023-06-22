import { Currency } from '@interfaces/bittrex.interface';
import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import TokensUtils from 'src/utils/tokens.utils';
import './token-item.component.scss';

interface TokenItemProps {
  tokenBalance: TokenBalance;
  tokenInfo: Token;
  market: TokenMarket[];
  ariaLabel?: string;
  hive: Currency;
}

const TokenItem = ({
  tokenBalance,
  tokenInfo,
  market,
  ariaLabel,
  navigateToWithParams,
  hive,
}: PropsFromRedux) => {
  const [isExpandablePanelOpen, setExpandablePanelOpen] = useState(false);

  const stake = () => {
    navigateToWithParams(Screen.TOKENS_OPERATION, {
      tokenBalance,
      operationType: TokenOperationType.STAKE,
      tokenInfo: tokenInfo,
    });
  };

  const unstake = () => {
    navigateToWithParams(Screen.TOKENS_OPERATION, {
      tokenBalance,
      operationType: TokenOperationType.UNSTAKE,
      tokenInfo: tokenInfo,
    });
  };

  const delegate = () => {
    navigateToWithParams(Screen.TOKENS_OPERATION, {
      tokenBalance,
      operationType: TokenOperationType.DELEGATE,
      tokenInfo: tokenInfo,
    });
  };

  const goToOutgoingDelegations = () => {
    navigateToWithParams(Screen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.OUTGOING,
      tokenInfo: tokenInfo,
    });
  };

  const goToIncomingDelegations = () => {
    navigateToWithParams(Screen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.INCOMING,
      tokenInfo: tokenInfo,
    });
  };

  const goToTokenWebsite = () => {
    chrome.tabs.create({ url: tokenInfo.metadata.url });
  };

  return (
    <div data-testid={ariaLabel} className="token-item">
      <div
        data-testid={`token-user-symbol-${tokenBalance.symbol}`}
        className="token"
        onClick={() => setExpandablePanelOpen(!isExpandablePanelOpen)}>
        <img
          className="token-icon"
          src={tokenInfo.metadata.icon ?? '/assets/images/hive-engine.svg'}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = '/assets/images/hive-engine.svg';
          }}
        />
        <div className="symbol-balance">
          <div className="symbol">{tokenBalance.symbol}</div>

          <div className="balance">
            {FormatUtils.withCommas(tokenBalance.balance, 3)}
          </div>
        </div>
        <Icon
          dataTestId={`icon-token-history-${tokenBalance.symbol}`}
          name={Icons.HISTORY}
          onClick={() =>
            navigateToWithParams(Screen.TOKENS_HISTORY, { tokenBalance })
          }
          additionalClassName="history"
          type={IconType.OUTLINED}></Icon>
        <Icon
          dataTestId={`icon-send-history-${tokenBalance.symbol}`}
          name={Icons.SEND}
          onClick={() =>
            navigateToWithParams(Screen.TOKENS_TRANSFER, {
              tokenBalance,
              tokenInfo,
            })
          }
          additionalClassName="send"
          type={IconType.OUTLINED}></Icon>
        <Icon
          dataTestId={`icon-expand-more-${tokenBalance.symbol}`}
          name={Icons.EXPAND_MORE}
          onClick={() => setExpandablePanelOpen(!isExpandablePanelOpen)}
          additionalClassName={`more ${
            isExpandablePanelOpen ? 'opened' : 'closed'
          }`}
          type={IconType.OUTLINED}></Icon>
      </div>
      {tokenInfo && (
        <div
          data-testid={`token-info-expandable-panel-${tokenBalance.symbol}`}
          className={
            isExpandablePanelOpen
              ? 'expandable-panel opened'
              : 'expandable-panel closed'
          }>
          <div className="token-info">
            <div
              data-testid={`token-info-go-to-website-${tokenBalance.symbol}`}
              className="token-description"
              onClick={goToTokenWebsite}>
              <div className="token-name-issuer">
                {tokenInfo.issuer && tokenInfo.issuer !== 'null' && (
                  <span className="token-issuer">@{tokenInfo.issuer}</span>
                )}
              </div>
            </div>
            <div>
              {chrome.i18n.getMessage('token_value')} : $
              {TokensUtils.getHiveEngineTokenValue(
                tokenBalance,
                market,
                hive,
              ).toFixed(2)}{' '}
              ($
              {(
                TokensUtils.getHiveEngineTokenPrice(tokenBalance, market) *
                hive?.usd!
              ).toFixed(2)}
              /{chrome.i18n.getMessage('token').toLowerCase()})
            </div>
            <div>
              {chrome.i18n.getMessage('liquid_balance')} :{' '}
              {FormatUtils.trimUselessZero(
                parseFloat(tokenBalance.balance),
                tokenInfo.precision,
              )}
            </div>
            {tokenInfo.stakingEnabled && (
              <div>
                {chrome.i18n.getMessage('popup_html_token_staking')} :{' '}
                {FormatUtils.trimUselessZero(
                  parseFloat(tokenBalance.stake),
                  tokenInfo.precision,
                )}
              </div>
            )}
            {tokenInfo.stakingEnabled &&
              parseFloat(tokenBalance.pendingUnstake) > 0 && (
                <div>
                  {chrome.i18n.getMessage('popup_html_token_pending_unstake')} :{' '}
                  {FormatUtils.trimUselessZero(
                    parseFloat(tokenBalance.pendingUnstake),
                    tokenInfo.precision,
                  )}
                </div>
              )}
            {tokenInfo.delegationEnabled && (
              <div
                data-testid={`button-go-to-incoming-delegations-${tokenBalance.symbol}`}
                className="delegation-line"
                onClick={goToIncomingDelegations}>
                {chrome.i18n.getMessage('popup_html_token_delegation_in')} :{' '}
                {FormatUtils.trimUselessZero(
                  parseFloat(tokenBalance.delegationsIn),
                  tokenInfo.precision,
                )}
                {parseFloat(tokenBalance.delegationsIn) > 0 && (
                  <Icon type={IconType.OUTLINED} name={Icons.LIST} />
                )}
              </div>
            )}
            {tokenInfo.delegationEnabled && (
              <div
                data-testid={`button-go-to-outgoing-delegations-${tokenBalance.symbol}`}
                className="delegation-line"
                onClick={goToOutgoingDelegations}>
                <div>
                  {chrome.i18n.getMessage('popup_html_token_delegation_out')} :{' '}
                  {FormatUtils.trimUselessZero(
                    parseFloat(tokenBalance.delegationsOut),
                    tokenInfo.precision,
                  )}
                </div>
                {parseFloat(tokenBalance.delegationsOut) > 0 && (
                  <Icon type={IconType.OUTLINED} name={Icons.LIST} />
                )}
              </div>
            )}
            {tokenInfo.delegationEnabled &&
              parseFloat(tokenBalance.pendingUndelegations) > 0 && (
                <div>
                  {chrome.i18n.getMessage(
                    'popup_html_token_pending_undelegation',
                  )}{' '}
                  : {tokenBalance.pendingUndelegations}
                </div>
              )}
          </div>
          {tokenInfo &&
            (tokenInfo.delegationEnabled || tokenInfo.stakingEnabled) && (
              <div className="button-panel">
                {tokenInfo.stakingEnabled && (
                  <div
                    data-testid={`button-token-stake-${tokenBalance.symbol}`}
                    className="action-button stake"
                    onClick={() => stake()}>
                    {chrome.i18n.getMessage('popup_html_token_stake')}
                  </div>
                )}
                {tokenInfo.stakingEnabled && (
                  <div
                    data-testid={`button-token-unstake-${tokenBalance.symbol}`}
                    className="action-button unstake"
                    onClick={() => unstake()}>
                    {chrome.i18n.getMessage('popup_html_token_unstake')}
                  </div>
                )}
                {tokenInfo.delegationEnabled && (
                  <div
                    data-testid={`button-token-delegate-${tokenBalance.symbol}`}
                    className="action-button delegate"
                    onClick={() => delegate()}>
                    {chrome.i18n.getMessage('popup_html_token_delegate')}
                  </div>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    tokens: state.tokens,
    hive: state.currencyPrices.hive,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> & TokenItemProps;

export const TokenItemComponent = connector(TokenItem);
