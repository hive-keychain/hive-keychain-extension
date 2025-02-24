import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { DelegationType } from '@popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import {
  ActionButton,
  WalletInfoSectionActions,
} from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-actions';
import { WalletInfoSectionItemButton } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item-button/wallet-info-section-item-button.component';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { Asset } from 'hive-keychain-commons';
import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface WalletSectionInfoItemProps {
  tokenSymbol: string;
  tokenInfo?: Token;
  tokenBalance?: TokenBalance;
  tokenMarket?: TokenMarket[];
  icon: SVGIcons;
  addBackground?: boolean;
  mainValue: string | Asset | number;
  mainValueLabel: string;
  subValue?: string | Asset | number;
  subValueLabel?: string;
}

const walletInfoSectionItem = ({
  tokenSymbol,
  tokenInfo,
  tokenBalance,
  tokenMarket,
  icon,
  addBackground,
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  hive,
  pendingUnstaking,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const reff = useRef<HTMLDivElement>(null);

  const [hasButtonsInList, setHasButtonInList] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setActionButtons(
      WalletInfoSectionActions(tokenSymbol, tokenInfo, tokenBalance),
    );

    if (
      tokenBalance?.delegationsOut &&
      parseFloat(tokenBalance.delegationsOut) > 0
    ) {
      setHasButtonInList(true);
    }

    if (
      tokenBalance?.delegationsIn &&
      parseFloat(tokenBalance.delegationsIn) > 0
    ) {
      setHasButtonInList(true);
    }

    if (
      tokenBalance?.pendingUnstake &&
      parseFloat(tokenBalance.pendingUnstake) > 0
    ) {
      setHasButtonInList(true);
    }
  };

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClick = (
    event: BaseSyntheticEvent,
    actionButton: ActionButton,
  ) => {
    event.stopPropagation();
    navigateToWithParams(
      actionButton.nextScreen,
      actionButton.nextScreenParams,
    );
  };

  const handleHistoryClick = (
    event: BaseSyntheticEvent,
    tokenBalance?: TokenBalance,
  ) => {
    event.stopPropagation();
    if (tokenBalance) {
      navigateToWithParams(Screen.TOKENS_HISTORY, { tokenBalance });
    } else {
      navigateToWithParams(Screen.WALLET_HISTORY_PAGE, []);
    }
  };

  const goToTokenWebsite = (token: Token) => {
    chrome.tabs.create({ url: token.metadata.url });
  };

  const goToTokenOutgoingDelegations = () => {
    navigateToWithParams(Screen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.OUTGOING,
      tokenInfo: tokenInfo,
    });
  };

  const goToTokenIncomingDelegations = () => {
    navigateToWithParams(Screen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.INCOMING,
      tokenInfo: tokenInfo,
    });
  };
  const goToPendingUnstakePage = () => {
    navigateToWithParams(Screen.TOKENS_PENDING_UNSTAKE, {
      tokenInfo: tokenInfo,
      pendingUnstaking: pendingUnstaking,
    });
  };

  return (
    <div
      className={`wallet-info-row ${isExpanded ? 'opened' : ''}`}
      data-testid={`wallet-info-section-row`}
      ref={reff}
      onClick={() => {
        toggleDropdown();
        !process.env.IS_FIREFOX &&
          reff.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'center',
          });
      }}>
      <div className="information-panel">
        {!tokenInfo && (
          <SVGIcon
            icon={icon}
            className={`currency-icon ${addBackground ? 'add-background' : ''}`}
          />
        )}
        {tokenInfo && (
          <PreloadedImage
            src={tokenInfo?.metadata.icon}
            className="currency-icon"
            addBackground
            symbol={tokenInfo.symbol}
            useDefaultSVG={icon}
          />
        )}
        <div className="main-value-label">{mainValueLabel}</div>
        <div className="value">
          <div className="main-value">
            {FormatUtils.formatCurrencyValue(mainValue)}
          </div>
          {!!subValue &&
            parseFloat(FormatUtils.formatCurrencyValue(subValue)) !== 0 && (
              <div className="sub-value">
                {parseFloat(subValue?.toString()) > 0 ? '+' : ''}
                {FormatUtils.formatCurrencyValue(subValue)} ({subValueLabel})
              </div>
            )}
        </div>
        {isExpanded && (
          <SVGIcon
            icon={SVGIcons.WALLET_HISTORY_BUTTON}
            className={`history-icon`}
            onClick={($event) => handleHistoryClick($event, tokenBalance)}
            hoverable
          />
        )}
      </div>
      {isExpanded && (
        <>
          {tokenInfo && tokenBalance && tokenMarket && (
            <div
              className={`token-info-panel ${
                hasButtonsInList ? 'has-button-in-list' : ''
              }`}>
              {tokenInfo.issuer && tokenInfo.issuer !== 'null' && (
                <>
                  <div
                    data-testid={`token-info-go-to-website-${tokenBalance.symbol}`}
                    className="token-info-row"
                    onClick={() => goToTokenWebsite(tokenInfo)}>
                    <div className="label">
                      {chrome.i18n.getMessage('html_tokens_issuer')}
                    </div>
                    <div className="value">
                      <span className="token-issuer">@{tokenInfo.issuer}</span>
                    </div>
                    <div></div>
                  </div>
                  <Separator type="horizontal" />
                </>
              )}
              <div className="token-info-row">
                <div className="label">
                  {chrome.i18n.getMessage('token_value')}
                </div>
                <div className="value">
                  $
                  {TokensUtils.getHiveEngineTokenValue(
                    tokenBalance,
                    tokenMarket,
                    hive,
                    [tokenInfo],
                  ).toFixed(3)}{' '}
                  ($
                  {(
                    TokensUtils.getHiveEngineTokenPrice(
                      tokenBalance,
                      tokenMarket,
                    ) * hive?.usd!
                  ).toFixed(3)}
                  /{chrome.i18n.getMessage('token').toLowerCase()})
                </div>
                <div></div>
              </div>
              <Separator type="horizontal" />
              <div className="token-info-row">
                <div className="label">
                  {chrome.i18n.getMessage('liquid_balance')}
                </div>
                <div className="value">
                  {FormatUtils.trimUselessZero(
                    parseFloat(tokenBalance.balance),
                    tokenInfo.precision,
                  )}
                </div>
                <div></div>
              </div>
              {tokenInfo.stakingEnabled && (
                <>
                  <Separator type="horizontal" />
                  <div className="token-info-row">
                    <div className="label">
                      {chrome.i18n.getMessage('popup_html_token_staking')}{' '}
                    </div>
                    <div className="value">
                      {FormatUtils.trimUselessZero(
                        parseFloat(tokenBalance.stake),
                        tokenInfo.precision,
                      )}
                    </div>
                    <div></div>
                  </div>
                </>
              )}
              {tokenInfo.stakingEnabled &&
                parseFloat(tokenBalance.pendingUnstake) > 0 && (
                  <>
                    <Separator type="horizontal" />
                    <div
                      className="token-info-row"
                      onClick={goToPendingUnstakePage}>
                      <div className="label">
                        {chrome.i18n.getMessage(
                          'popup_html_token_pending_unstake',
                        )}
                      </div>
                      <div className="value">
                        {FormatUtils.trimUselessZero(
                          parseFloat(tokenBalance.pendingUnstake),
                          tokenInfo.precision,
                        )}
                      </div>
                      <div className="icon">
                        {parseFloat(tokenBalance.pendingUnstake) > 0 && (
                          <SVGIcon
                            className="go-to-page-icon"
                            icon={SVGIcons.WALLET_TOKEN_GO_TO_DETAILED_PAGE}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              {tokenInfo.delegationEnabled && (
                <>
                  <Separator type="horizontal" />
                  <div
                    data-testid={`button-go-to-outgoing-delegations-${tokenBalance.symbol}`}
                    className="token-info-row"
                    onClick={goToTokenIncomingDelegations}>
                    <div className="label">
                      {chrome.i18n.getMessage('popup_html_token_delegation_in')}
                    </div>
                    <div className="value">
                      {FormatUtils.trimUselessZero(
                        parseFloat(tokenBalance.delegationsIn),
                        tokenInfo.precision,
                      )}
                    </div>
                    <div className="icon">
                      {parseFloat(tokenBalance.delegationsIn) > 0 && (
                        <SVGIcon
                          className="go-to-page-icon"
                          icon={SVGIcons.WALLET_TOKEN_GO_TO_DETAILED_PAGE}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
              {tokenInfo.delegationEnabled &&
                parseFloat(tokenBalance.delegationsOut) > 0 && (
                  <>
                    <Separator type="horizontal" />
                    <div
                      aria-label="button-go-to-outgoing-delegations"
                      className="token-info-row"
                      onClick={goToTokenOutgoingDelegations}>
                      <div className="label">
                        {chrome.i18n.getMessage(
                          'popup_html_token_delegation_out',
                        )}
                      </div>
                      <div className="value">
                        {' '}
                        {FormatUtils.trimUselessZero(
                          parseFloat(tokenBalance.delegationsOut),
                          tokenInfo.precision,
                        )}
                      </div>
                      <div className="icon">
                        {parseFloat(tokenBalance.delegationsOut) > 0 && (
                          <SVGIcon
                            className="go-to-page-icon"
                            icon={SVGIcons.WALLET_TOKEN_GO_TO_DETAILED_PAGE}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
              {tokenInfo.delegationEnabled &&
                parseFloat(tokenBalance.pendingUndelegations) > 0 && (
                  <>
                    <Separator type="horizontal" />
                    <div className="token-info-row">
                      <div className="label">
                        {chrome.i18n.getMessage(
                          'popup_html_token_pending_undelegation',
                        )}
                      </div>
                      <div className="value">
                        {tokenBalance.pendingUndelegations}
                      </div>
                      <div></div>
                    </div>
                  </>
                )}
            </div>
          )}
          <div className="actions-panel">
            {actionButtons.map((ab, index) => (
              <WalletInfoSectionItemButton
                key={`action-${ab.label}-${index}`}
                actionButton={ab}
                handleClick={handleClick}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    globalProperties: state.hive.globalProperties,
    hive: state.hive.currencyPrices.hive,
    pendingUnstaking: state.hive.tokensPendingUnstaking,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> &
  WalletSectionInfoItemProps;

export const WalletInfoSectionItemComponent = connector(walletInfoSectionItem);
