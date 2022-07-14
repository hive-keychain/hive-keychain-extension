import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import FormatUtils from 'src/utils/format.utils';
import './token-item.component.scss';

interface TokenItemProps {
  tokenBalance: TokenBalance;
  tokenInfo: Token;
  ariaLabel?: string;
}

const TokenItem = ({
  tokenBalance,
  tokens,
  tokenInfo,
  ariaLabel,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isExpandablePanelOpen, setExpandablePanelOpen] = useState(false);
  const [token, setToken] = useState<Token>();

  useEffect(() => {
    if (tokens && tokens.length) {
      setToken(tokens.find((t) => t.symbol === tokenBalance.symbol));
    }
  }, [tokens]);

  const stake = () => {
    navigateToWithParams(Screen.TOKENS_OPERATION, {
      tokenBalance,
      operationType: TokenOperationType.STAKE,
      tokenInfo: token,
    });
  };

  const unstake = () => {
    navigateToWithParams(Screen.TOKENS_OPERATION, {
      tokenBalance,
      operationType: TokenOperationType.UNSTAKE,
      tokenInfo: token,
    });
  };

  const delegate = () => {
    navigateToWithParams(Screen.TOKENS_OPERATION, {
      tokenBalance,
      operationType: TokenOperationType.DELEGATE,
      tokenInfo: token,
    });
  };

  const goToOutgoingDelegations = () => {
    navigateToWithParams(Screen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.OUTGOING,
      tokenInfo: token,
    });
  };

  const goToIncomingDelegations = () => {
    navigateToWithParams(Screen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.INCOMING,
      tokenInfo: token,
    });
  };

  const goToTokenWebsite = () => {
    chrome.tabs.create({ url: tokenInfo.metadata.url });
  };

  return (
    <div aria-label={ariaLabel} className="token-item">
      <div
        aria-label={`token-user-symbol-${tokenBalance.symbol}`}
        className="token"
        onClick={() => setExpandablePanelOpen(!isExpandablePanelOpen)}>
        <CustomTooltip
          message={
            FormatUtils.hasMoreThanXDecimal(parseFloat(tokenBalance.balance), 3)
              ? FormatUtils.withCommas(tokenBalance.balance, 8)
              : undefined
          }>
          <div className="balance">
            {FormatUtils.withCommas(tokenBalance.balance, 3)}
          </div>
        </CustomTooltip>
        <div className="symbol">{tokenBalance.symbol}</div>
        <Icon
          ariaLabel={`icon-token-history-${tokenBalance.symbol}`}
          name={Icons.HISTORY}
          onClick={() =>
            navigateToWithParams(Screen.TOKENS_HISTORY, { tokenBalance })
          }
          additionalClassName="history"
          type={IconType.OUTLINED}></Icon>
        <Icon
          ariaLabel={`icon-send-history-${tokenBalance.symbol}`}
          name={Icons.SEND}
          onClick={() =>
            navigateToWithParams(Screen.TOKENS_TRANSFER, { tokenBalance })
          }
          additionalClassName="send"
          type={IconType.OUTLINED}></Icon>
        <Icon
          ariaLabel={`icon-expand-more-${tokenBalance.symbol}`}
          name={Icons.EXPAND_MORE}
          onClick={() => setExpandablePanelOpen(!isExpandablePanelOpen)}
          additionalClassName={`more ${
            isExpandablePanelOpen ? 'opened' : 'closed'
          }`}
          type={IconType.OUTLINED}></Icon>
      </div>
      {token && (
        <div
          aria-label="token-info-expandable-panel"
          className={
            isExpandablePanelOpen
              ? 'expandable-panel opened'
              : 'expandable-panel closed'
          }>
          <div className="token-info">
            <div
              aria-label="token-info-go-to-website"
              className="token-description"
              onClick={goToTokenWebsite}>
              <img
                className="token-icon"
                src={
                  tokenInfo.metadata.icon ?? '/assets/images/hive-engine.svg'
                }
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = '/assets/images/hive-engine.svg';
                }}
              />
              <div className="token-name-issuer">
                <span className="token-name">{tokenInfo.name}</span>
                {tokenInfo.issuer && tokenInfo.issuer !== 'null' && (
                  <span className="token-issuer">@{tokenInfo.issuer}</span>
                )}
              </div>
            </div>
            <div>
              {chrome.i18n.getMessage('dialog_balance')} :{' '}
              {FormatUtils.hasMoreThanXDecimal(
                parseFloat(tokenBalance.balance),
                3,
              )
                ? FormatUtils.withCommas(tokenBalance.balance, 8)
                : FormatUtils.withCommas(tokenBalance.balance, 3)}
            </div>
            {token.stakingEnabled && (
              <div>
                {chrome.i18n.getMessage('popup_html_token_staking')} :{' '}
                {tokenBalance.stake}
              </div>
            )}
            {token.stakingEnabled &&
              parseFloat(tokenBalance.pendingUnstake) > 0 && (
                <div>
                  {chrome.i18n.getMessage('popup_html_token_pending_unstake')} :{' '}
                  {tokenBalance.pendingUnstake}
                </div>
              )}
            {token.delegationEnabled && (
              <div
                aria-label="button-go-to-incoming-delegations"
                className="delegation-line"
                onClick={goToIncomingDelegations}>
                {chrome.i18n.getMessage('popup_html_token_delegation_in')} :{' '}
                {tokenBalance.delegationsIn}
                {parseFloat(tokenBalance.delegationsIn) > 0 && (
                  <Icon type={IconType.OUTLINED} name={Icons.LIST} />
                )}
              </div>
            )}
            {token.delegationEnabled && (
              <div
                aria-label="button-go-to-outgoing-delegations"
                className="delegation-line"
                onClick={goToOutgoingDelegations}>
                <div>
                  {chrome.i18n.getMessage('popup_html_token_delegation_out')} :{' '}
                  {tokenBalance.delegationsOut}
                </div>
                {parseFloat(tokenBalance.delegationsOut) > 0 && (
                  <Icon type={IconType.OUTLINED} name={Icons.LIST} />
                )}
              </div>
            )}
            {token.delegationEnabled &&
              parseFloat(tokenBalance.pendingUndelegations) > 0 && (
                <div>
                  {chrome.i18n.getMessage(
                    'popup_html_token_pending_undelegation',
                  )}{' '}
                  : {tokenBalance.pendingUndelegations}
                </div>
              )}
          </div>
          {token && (token.delegationEnabled || token.stakingEnabled) && (
            <div className="button-panel">
              {token.stakingEnabled && (
                <div
                  aria-label="button-token-stake"
                  className="action-button stake"
                  onClick={() => stake()}>
                  {chrome.i18n.getMessage('popup_html_token_stake')}
                </div>
              )}
              {token.stakingEnabled && (
                <div
                  aria-label="button-token-unstake"
                  className="action-button unstake"
                  onClick={() => unstake()}>
                  {chrome.i18n.getMessage('popup_html_token_unstake')}
                </div>
              )}
              {token.delegationEnabled && (
                <div
                  aria-label="button-token-delegate"
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
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> & TokenItemProps;

export const TokenItemComponent = connector(TokenItem);
