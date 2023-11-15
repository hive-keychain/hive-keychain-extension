import { Asset } from '@hiveio/dhive';
import { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { navigateToWithParams } from '@popup/hive/actions/navigation.actions';
import { DelegationType } from '@popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import {
  ActionButton,
  WalletInfoSectionActions,
} from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-actions';
import { WalletInfoSectionItemButton } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item-button/wallet-info-section-item-button.component';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { Screen } from '@reference-data/screen.enum';
import React, { BaseSyntheticEvent, useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { RootState } from 'src/popup/hive/store';
import { ColorsUtils } from 'src/utils/colors.utils';
import FormatUtils from 'src/utils/format.utils';

interface WalletSectionInfoItemProps {
  tokenSymbol: string;
  tokenInfo?: Token;
  tokenBalance?: TokenBalance;
  tokenMarket?: TokenMarket[];
  icon: NewIcons;
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
  navigateToWithParams,
}: PropsFromRedux) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const [backgroundColor, setBackgroundColor] = useState<string>();
  const reff = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActionButtons(
      WalletInfoSectionActions(tokenSymbol, tokenInfo, tokenBalance),
    );

    if (tokenInfo && addBackground) {
      const bg = ColorsUtils.getBackgroundColor(
        tokenInfo.metadata.icon ?? '/assets/images/hive-engine.svg',
      );
      setBackgroundColor(bg);
    }
  }, []);

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

  return (
    <div
      className={`wallet-info-row ${isExpanded ? 'opened' : ''}`}
      data-testid={`wallet-info-section-row`}
      ref={reff}
      onClick={() => {
        toggleDropdown();
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
          <img
            className={`currency-icon ${addBackground ? 'add-background' : ''}`}
            src={
              tokenInfo.metadata.icon ?? '/assets/images/wallet/hive-engine.svg'
            }
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = '/assets/images/wallet/hive-engine.svg';
            }}
            style={backgroundColor ? { background: backgroundColor } : {}}
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
            icon={NewIcons.WALLET_HISTORY_BUTTON}
            className={`history-icon`}
            onClick={($event) => handleHistoryClick($event, tokenBalance)}
            hoverable
          />
        )}
      </div>
      {isExpanded && (
        <>
          {tokenInfo && tokenBalance && tokenMarket && (
            <div className="token-info-panel">
              <div
                data-testid={`token-info-go-to-website-${tokenBalance.symbol}`}
                className="token-description"
                onClick={() => goToTokenWebsite(tokenInfo)}>
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
                  tokenMarket,
                  hive,
                ).toFixed(2)}{' '}
                ($
                {(
                  TokensUtils.getHiveEngineTokenPrice(
                    tokenBalance,
                    tokenMarket,
                  ) * hive?.usd!
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
                    {chrome.i18n.getMessage('popup_html_token_pending_unstake')}{' '}
                    :{' '}
                    {FormatUtils.trimUselessZero(
                      parseFloat(tokenBalance.pendingUnstake),
                      tokenInfo.precision,
                    )}
                  </div>
                )}
              {tokenInfo.delegationEnabled && (
                <div
                  data-testid={`button-go-to-outgoing-delegations-${tokenBalance.symbol}`}
                  className="delegation-line"
                  onClick={goToTokenIncomingDelegations}>
                  <div>
                    {chrome.i18n.getMessage('popup_html_token_delegation_in')} :{' '}
                    {FormatUtils.trimUselessZero(
                      parseFloat(tokenBalance.delegationsIn),
                      tokenInfo.precision,
                    )}
                  </div>
                  {parseFloat(tokenBalance.delegationsIn) > 0 && (
                    <SVGIcon
                      className="go-to-page-icon"
                      icon={NewIcons.WALLET_TOKEN_GO_TO_DETAILED_PAGE}
                    />
                  )}
                </div>
              )}
              {tokenInfo.delegationEnabled &&
                parseFloat(tokenBalance.delegationsOut) > 0 && (
                  <div
                    aria-label="button-go-to-outgoing-delegations"
                    className="delegation-line"
                    onClick={goToTokenOutgoingDelegations}>
                    <div>
                      {chrome.i18n.getMessage(
                        'popup_html_token_delegation_out',
                      )}{' '}
                      :{' '}
                      {FormatUtils.trimUselessZero(
                        parseFloat(tokenBalance.delegationsOut),
                        tokenInfo.precision,
                      )}
                    </div>
                    {parseFloat(tokenBalance.delegationsOut) > 0 && (
                      <SVGIcon
                        className="go-to-page-icon"
                        icon={NewIcons.WALLET_TOKEN_GO_TO_DETAILED_PAGE}
                      />
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
          )}
          <Separator type={'horizontal'} />
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
    globalProperties: state.globalProperties,
    hive: state.currencyPrices.hive,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> &
  WalletSectionInfoItemProps;

export const WalletInfoSectionItemComponent = connector(walletInfoSectionItem);
