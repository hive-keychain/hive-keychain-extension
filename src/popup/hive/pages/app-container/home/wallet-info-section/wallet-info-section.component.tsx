import { Conversion } from '@interfaces/conversion.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import {
  loadPendingUnstaking,
  loadTokens,
  loadTokensMarket,
  loadUserTokens,
} from '@popup/hive/actions/token.actions';
import { loadVscAccountBalance } from '@popup/hive/actions/vsc.actions';
import {
  WalletInfoSectionHiveActions,
  WalletInfoSectionVscActions,
} from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-actions';
import { WalletInfoSectionHiveEngineItemComponent } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-hive-engine-item.component';
import { WalletInfoSectionItemComponent } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import FlatList from 'flatlist-react';
import { Asset, FormatUtils, LoadingState } from 'hive-keychain-commons';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { fetchConversionRequests } from 'src/popup/hive/actions/conversion.actions';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
  conversions,
  userTokens,
  market,
  allTokens,
  fetchConversionRequests,
  loadTokensMarket,
  navigateTo,
  loadUserTokens,
  loadTokens,
  loadPendingUnstaking,
  loadVscAccountBalance,
  navigateToWithParams,
  vscAccountBalance,
}: PropsFromRedux) => {
  const [delegationAmount, setDelegationAmount] = useState<string | number>(
    '...',
  );

  const [filteredTokenList, setFilteredTokenList] = useState<TokenBalance[]>();
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);
  const [tokenFilter, setTokenFilter] = useState('');
  const [showSearchHE, setShowSearchHE] = useState(false);
  const [showHeTokens, setShowHeTokens] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  useEffect(() => {
    if (activeAccount && !ActiveAccountUtils.isEmpty(activeAccount)) {
      loadHiddenTokens();
      loadTokens();
      loadTokensMarket();
      loadVscAccountBalance(activeAccount.name!);
      loadUserTokens(activeAccount.name!);
      loadPendingUnstaking(activeAccount.name!);
      fetchConversionRequests(activeAccount.name!);

      const delegatedVestingShares = parseFloat(
        activeAccount.account.delegated_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const receivedVestingShares = parseFloat(
        activeAccount.account.received_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const delegationVestingShares = (
        receivedVestingShares - delegatedVestingShares
      ).toFixed(3);

      const delegation = FormatUtils.toHP(
        delegationVestingShares,
        globalProperties.globals,
      );
      setDelegationAmount(delegation);
    }
  }, [activeAccount.name]);

  useEffect(() => {
    if (userTokens.loading) {
      // addToLoadingList('html_popup_loading_tokens_operation');
    } else if (userTokens.list && market.length) {
      // removeFromLoadingList('html_popup_loading_tokens_operation');
      const orderedFiltered = userTokens.list
        .filter((token) => !hiddenTokens.includes(token.symbol))
        .sort(
          (a, b) =>
            TokensUtils.getHiveEngineTokenValue(
              b,
              market,
              undefined,
              allTokens,
            ) -
            TokensUtils.getHiveEngineTokenValue(
              a,
              market,
              undefined,
              allTokens,
            ),
        );
      setFilteredTokenList(orderedFiltered);
    }
  }, [userTokens, market]);

  useEffect(() => {
    const pendingHbdConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HBD';
    });
    if (pendingHbdConversions.length > 0) {
      // setHbdRowInfoContent(
      //   chrome.i18n.getMessage('popup_html_pending_conversions', [
      //     pendingHbdConversions.length.toString(),
      //     'HIVE',
      //   ]),
      // );
    }

    const pendingHiveConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HIVE';
    });

    if (pendingHiveConversions.length > 0) {
      // setHiveRowInfoContent(
      //   chrome.i18n.getMessage('popup_html_pending_conversions', [
      //     pendingHiveConversions.length.toString(),
      //     'HIVE',
      //   ]),
      // );
    }
  }, [conversions]);

  const handleHistoryClick = () => {
    navigateToWithParams(Screen.WALLET_HISTORY_PAGE, []);
  };

  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        <WalletInfoSectionItemComponent
          tokenSymbol="HIVE"
          iconName={SVGIcons.WALLET_HIVE_LOGO}
          mainValue={activeAccount.account.balance}
          onHistoryClick={handleHistoryClick}
          mainValueLabel={currencyLabels.hive}
          subValue={activeAccount.account.savings_balance}
          subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
          actionButtons={WalletInfoSectionHiveActions('HIVE')}
        />
        <WalletInfoSectionItemComponent
          tokenSymbol="HBD"
          iconName={SVGIcons.WALLET_HBD_LOGO}
          mainValue={activeAccount.account.hbd_balance}
          mainValueLabel={currencyLabels.hbd}
          subValue={activeAccount.account.savings_hbd_balance}
          subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
          actionButtons={WalletInfoSectionHiveActions('HBD')}
          onHistoryClick={handleHistoryClick}
        />
        <WalletInfoSectionItemComponent
          tokenSymbol="HP"
          iconName={SVGIcons.WALLET_HP_LOGO}
          actionButtons={WalletInfoSectionHiveActions('HP')}
          onHistoryClick={handleHistoryClick}
          mainValue={FormatUtils.toHP(
            activeAccount.account.vesting_shares as string,
            globalProperties.globals,
          )}
          mainValueLabel={currencyLabels.hp}
          subValue={delegationAmount}
          subValueLabel={
            chrome.i18n.getMessage('popup_html_delegations').length <= 5
              ? chrome.i18n.getMessage('popup_html_delegations')
              : chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) +
                '.'
          }
        />

        <div className="l2-separator">
          <span>
            <SVGIcon icon={SVGIcons.HIVE_ENGINE} className="no-pointer" />
          </span>
          <div
            className="line-wrapper pointer"
            onClick={() => {
              setShowHeTokens(!showHeTokens);
            }}>
            <div className="line" />
          </div>

          <InputComponent
            classname={`token-searchbar ${showSearchHE ? '' : 'hide'}`}
            type={InputType.TEXT}
            placeholder="popup_html_search"
            onChange={(e) => {
              setTokenFilter(e);
            }}
            value={tokenFilter}
            rightActionIcon={SVGIcons.WALLET_SEARCH}
            rightActionClicked={() => {
              setShowSearchHE(false);
            }}
            ref={inputRef}
          />

          <SVGIcon
            icon={SVGIcons.WALLET_SEARCH}
            className={`token-search ${!showSearchHE ? '' : 'hide'}`}
            onClick={() => {
              setShowSearchHE(true);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 200);
            }}
          />

          <SVGIcon
            icon={SVGIcons.WALLET_SETTINGS}
            onClick={() => {
              navigateTo(Screen.TOKENS_FILTER);
            }}
          />
        </div>
        {allTokens?.length > 0 &&
          filteredTokenList &&
          filteredTokenList.length > 0 &&
          showHeTokens && (
            <>
              <FlatList
                list={filteredTokenList}
                renderItem={(token: TokenBalance) => (
                  <WalletInfoSectionHiveEngineItemComponent
                    key={`token-${token.symbol}`}
                    tokenSymbol={token.symbol}
                    tokenBalance={token}
                    tokenInfo={allTokens.find((t) => t.symbol === token.symbol)}
                    tokenMarket={market}
                    addBackground
                    mainValue={token.balance}
                    mainValueLabel={token.symbol}
                  />
                )}
                renderOnScroll
                searchBy="symbol"
                searchTerm={tokenFilter}
                searchCaseInsensitive
              />
            </>
          )}
        {filteredTokenList &&
          filteredTokenList.length === 0 &&
          showHeTokens && (
            <div className="no-token">
              <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
              <span className="text">
                {chrome.i18n.getMessage('html_tokens_none_available')}
              </span>
            </div>
          )}
        {filteredTokenList && !showHeTokens && (
          <div
            className="hidden-tokens"
            onClick={() => {
              setShowHeTokens(true);
            }}>
            <span className="text">
              {chrome.i18n.getMessage('html_tokens_x_available', [
                filteredTokenList.length + '',
              ])}
            </span>
          </div>
        )}
        <div className="l2-separator">
          <span>
            <a href="https://vsc.eco/" target="_blank">
              <img src="assets/images/wallet/vsc.png" className="no-pointer" />
            </a>
          </span>
          <div className="line-wrapper">
            <div className="line" />
          </div>
          {/* <SVGIcon
            icon={SVGIcons.WALLET_HISTORY_NO_BORDER}
            onClick={() => {
              navigateTo(Screen.VSC_HISTORY_PAGE);
            }}
          /> */}
        </div>
        {vscAccountBalance.state === LoadingState.LOADED && (
          <>
            <WalletInfoSectionItemComponent
              key={`vsc-hive`}
              tokenSymbol={currencyLabels.hive}
              mainValue={(vscAccountBalance?.balance?.hive || 0) / 1000}
              mainValueLabel={currencyLabels.hive}
              iconName={SVGIcons.WALLET_HIVE_VSC_LOGO}
              onHistoryClick={() => {
                navigateTo(Screen.VSC_HISTORY_PAGE);
              }}
              actionButtons={WalletInfoSectionVscActions('HIVE')}
            />
            <WalletInfoSectionItemComponent
              key={`vsc-hbd`}
              tokenSymbol={currencyLabels.hbd}
              mainValue={(vscAccountBalance?.balance?.hbd || 0) / 1000}
              mainValueLabel={currencyLabels.hbd}
              iconName={SVGIcons.WALLET_HBD_VSC_LOGO}
              onHistoryClick={() => {
                navigateTo(Screen.VSC_HISTORY_PAGE);
              }}
              subValue={(vscAccountBalance?.balance?.hbd_savings || 0) / 1000}
              actionButtons={WalletInfoSectionVscActions('HBD')}
              subValueLabel={chrome.i18n.getMessage(
                'popup_html_wallet_savings',
              )}
            />
          </>
        )}
        {vscAccountBalance.state === LoadingState.LOADING && (
          <div className="rotating-logo-container">
            <RotatingLogoComponent />
          </div>
        )}
        {vscAccountBalance.state === LoadingState.FAILED && (
          <div className="no-token">
            <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
            <span className="text">
              {chrome.i18n.getMessage('popup_html_vsc_unavailable')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(
      state.hive.activeRpc?.testnet!,
    ),
    globalProperties: state.hive.globalProperties,
    delegations: state.hive.delegations,
    conversions: state.hive.conversions,
    userTokens: state.hive.userTokens,
    market: state.hive.tokenMarket,
    allTokens: state.hive.tokens,
    vscAccountBalance: state.hive.vscBalance,
  };
};

const connector = connect(mapStateToProps, {
  fetchConversionRequests,
  loadTokensMarket,
  loadUserTokens,
  loadTokens,
  navigateTo,
  loadPendingUnstaking,
  loadVscAccountBalance,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
