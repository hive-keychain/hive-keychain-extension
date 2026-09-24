import {
  Token,
  TokenBalance,
  TokenMarket,
  TokenMetadata,
} from '@interfaces/tokens.interface';
import { DelegationType } from '@popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import {
  ActionButton,
  HiveWalletInfoSectionActions,
} from '@popup/hive/pages/app-container/home/hive-wallet-info-section/hive-wallet-info-section-actions';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Asset } from 'hive-keychain-commons';
import ImageUtils from 'hive-keychain-commons/lib/utils/images.utils';
import React, {
  BaseSyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { WalletInfoSectionItemButton } from 'src/common-ui/wallet-info-section-item-button/wallet-info-section-item-button.component';
import { WalletTokenDetailPanel } from 'src/common-ui/wallet-token-detail-panel/wallet-token-detail-panel.component';
import { WalletTokenPriceChart } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.component';
import FormatUtils from 'src/utils/format.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
/**
 * Stable `data-testid` for wallet row actions and Hive-Engine token buttons.
 * Matches `src/__tests__/utils-for-testing/data-testid/data-testid-dropdown.ts`.
 */
const walletInfoSectionActionButtonTestId = (
  tokenSymbol: string,
  label: string,
): string | undefined => {
  switch (label) {
    case 'popup_html_send':
      return `dropdown-menu-item-${SVGIcons.WALLET_SEND}`;
    case 'popup_html_convert':
      return `dropdown-menu-item-${SVGIcons.WALLET_CONVERT}`;
    case 'popup_html_savings':
      return 'dropdown-menu-item-savings';
    case 'popup_html_pu':
      return 'dropdown-menu-item-arrow_upward';
    case 'popup_html_delegate_short':
      return `dropdown-menu-item-${SVGIcons.WALLET_HP_DELEGATIONS}`;
    case 'popup_html_delegate_rc_short':
      return `dropdown-menu-item-${SVGIcons.WALLET_RC_DELEGATIONS}`;
    case 'dialog_title_powerdown':
      return 'dropdown-menu-item-arrow_downward';
    case 'popup_html_send_transfer':
      if (tokenSymbol === 'HIVE' || tokenSymbol === 'HBD') {
        return `dropdown-menu-item-${SVGIcons.WALLET_SEND}`;
      }
      return `icon-send-history-${tokenSymbol}`;
    case 'popup_html_token_stake':
      return `button-token-stake-${tokenSymbol}`;
    case 'popup_html_token_unstake':
      return `button-token-unstake-${tokenSymbol}`;
    case 'popup_html_token_delegate':
      return `button-token-delegate-${tokenSymbol}`;
    case 'html_popup_swaps_process_swap':
      return `dropdown-menu-item-${SVGIcons.PORTFOLIO_SWAP}`;
    case 'popup_html_buy':
      return `dropdown-menu-item-${SVGIcons.PORTFOLIO_BUY}`;
    default:
      return undefined;
  }
};

interface WalletSectionInfoItemProps {
  tokenSymbol: string;
  tokenInfo?: Token;
  tokenBalance?: TokenBalance;
  tokenMarket?: TokenMarket[];
  icon?: SVGIcons;
  defaultIcon?: SVGIcons;
  addBackground?: boolean;
  mainValue: string | Asset | number;
  mainValueLabel: string;
  subValue?: string | Asset | number;
  subValueLabel?: string;
}

export const WalletInfoSectionItem = ({
  tokenSymbol,
  tokenInfo,
  tokenBalance,
  tokenMarket,
  icon,
  defaultIcon,
  addBackground,
  mainValue,
  mainValueLabel,
  subValue,
  subValueLabel,
  hive,
  pendingUnstaking,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [detailsId] = useState(
    () => `hive-wallet-details-${tokenSymbol.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
  );
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);

  const [hasButtonsInList, setHasButtonInList] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setActionButtons(
      HiveWalletInfoSectionActions(tokenSymbol, tokenInfo, tokenBalance),
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

  const openPanel = () => {
    setIsPanelOpen(true);
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleClick = (
    event: BaseSyntheticEvent,
    actionButton: ActionButton,
  ) => {
    event.stopPropagation();
    closePanel();
    if (actionButton.onClick) {
      actionButton.onClick();
      return;
    }
    if (actionButton.nextScreen) {
      navigateToWithParams(
        actionButton.nextScreen,
        actionButton.nextScreenParams,
      );
    }
  };

  const handleHistoryClick = (
    event: BaseSyntheticEvent,
    tokenBalance?: TokenBalance,
  ) => {
    event.stopPropagation();
    closePanel();
    if (tokenBalance) {
      navigateToWithParams(HiveScreen.TOKENS_HISTORY, { tokenBalance });
    } else {
      navigateToWithParams(HiveScreen.WALLET_HISTORY_PAGE, []);
    }
  };

  const goToTokenWebsite = (token: Token) => {
    const metadata: TokenMetadata =
      typeof token.metadata === 'string'
        ? JSON.parse(token.metadata)
        : token.metadata;
    chrome.tabs.create({ url: metadata.url });
  };

  const goToTokenOutgoingDelegations = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    closePanel();
    navigateToWithParams(HiveScreen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.OUTGOING,
      tokenInfo: tokenInfo,
    });
  };

  const goToTokenIncomingDelegations = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    closePanel();
    navigateToWithParams(HiveScreen.TOKENS_DELEGATIONS, {
      tokenBalance: tokenBalance,
      delegationType: DelegationType.INCOMING,
      tokenInfo: tokenInfo,
    });
  };
  const goToPendingUnstakePage = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    closePanel();
    navigateToWithParams(HiveScreen.TOKENS_PENDING_UNSTAKE, {
      tokenInfo: tokenInfo,
      pendingUnstaking: pendingUnstaking,
    });
  };

  const tokenIconSrc = tokenInfo?.metadata?.icon
    ? ImageUtils.getImmutableImage(tokenInfo.metadata.icon)
    : '';

  return (
    <div className={`wallet-info-row ${isPanelOpen ? 'opened' : ''}`}>
      <div className="information-panel-hive">
        <button
          type="button"
          data-testid={
            tokenInfo
              ? 'token-user-item'
              : `dropdown-arrow-${tokenSymbol.toLowerCase()}`
          }
          className="wallet-info-disclosure"
          aria-expanded={isPanelOpen}
          aria-haspopup="dialog"
          aria-controls={isPanelOpen ? detailsId : undefined}
          onClick={openPanel}>
          {tokenInfo ? (
            <PreloadedImage
              src={tokenIconSrc}
              className="currency-icon"
              addBackground={addBackground}
              symbol={tokenInfo.symbol}
              useDefaultSVG={defaultIcon}
            />
          ) : (
            icon && (
              <SVGIcon
                icon={icon}
                className={`currency-icon ${
                  addBackground ? 'add-background' : ''
                }`}
              />
            )
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
        </button>
      </div>
      <WalletTokenDetailPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        title={mainValueLabel}
        titleId={detailsId}
        dataTestId={`wallet-token-detail-panel-${tokenSymbol}`}
        logo={
          tokenInfo ? (
            <PreloadedImage
              src={tokenIconSrc}
              className="currency-icon"
              addBackground={addBackground}
              symbol={tokenInfo.symbol}
              useDefaultSVG={defaultIcon}
            />
          ) : (
            icon && (
              <SVGIcon
                icon={icon}
                className={`currency-icon ${
                  addBackground ? 'add-background' : ''
                }`}
              />
            )
          )
        }
        headerAction={
          <div className="wallet-token-detail-panel-header-action">
            <SVGIcon
              icon={SVGIcons.WALLET_HISTORY_BUTTON}
              className="history-icon"
              dataTestId={`icon-token-history-${tokenSymbol}`}
              ariaLabel={I18nUtils.getMessage('popup_html_history')}
              onClick={($event) => handleHistoryClick($event, tokenBalance)}
              hoverable
            />
          </div>
        }
        footer={
          <div className="actions-panel">
            {actionButtons.map((ab, index) => (
              <WalletInfoSectionItemButton
                key={`action-${ab.label}-${index}`}
                actionButton={ab}
                handleClick={handleClick}
                dataTestId={walletInfoSectionActionButtonTestId(
                  tokenSymbol,
                  ab.label,
                )}
              />
            ))}
          </div>
        }>
        <div className="wallet-info-details">
          <WalletTokenPriceChart symbol={tokenSymbol} />
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
                      {I18nUtils.getMessage('html_tokens_issuer')}
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
                  {I18nUtils.getMessage('token_value')}
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
                  /{I18nUtils.getMessage('token').toLowerCase()})
                </div>
                <div></div>
              </div>
              <Separator type="horizontal" />
              <div className="token-info-row">
                <div className="label">
                  {I18nUtils.getMessage('liquid_balance')}
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
                      {I18nUtils.getMessage('popup_html_token_staking')}{' '}
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
                        {I18nUtils.getMessage(
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
                    data-testid={`button-go-to-incoming-delegations-${tokenBalance.symbol}`}
                    className="token-info-row"
                    onClick={goToTokenIncomingDelegations}>
                    <div className="label">
                      {I18nUtils.getMessage('popup_html_token_delegation_in')}
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
                      data-testid={`button-go-to-outgoing-delegations-${tokenBalance.symbol}`}
                      aria-label="button-go-to-outgoing-delegations"
                      className="token-info-row"
                      onClick={goToTokenOutgoingDelegations}>
                      <div className="label">
                        {I18nUtils.getMessage(
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
                        {I18nUtils.getMessage(
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
        </div>
      </WalletTokenDetailPanel>
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

export const HiveWalletInfoSectionItemComponent = connector(
  WalletInfoSectionItem,
);
