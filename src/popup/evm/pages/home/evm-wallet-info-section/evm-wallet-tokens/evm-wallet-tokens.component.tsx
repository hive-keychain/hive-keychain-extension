import { Card } from '@common-ui/card/card.component';
import { SVGIcons } from '@common-ui/icons.enum';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import {
  isCustomErc20EmptyCardHiddenForChain,
  setCustomErc20EmptyCardHiddenForChain,
} from '@popup/evm/utils/evm-custom-erc20-empty-card.utils';
import { EvmAutoDetectedTokenVisibilityUtils } from '@popup/evm/utils/evm-auto-detected-token-visibility.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
interface OwnProps {
  chain: EvmChain;
  activeAccount: EvmActiveAccount;
  reloadEvmActiveAccount: () => Promise<void>;
}

const EvmWalletTokensInner = ({
  chain,
  activeAccount,
  navigateTo,
}: OwnProps & PropsFromRedux) => {
  const [displayedTokens, setDisplayedTokens] = useState<NativeAndErc20Token[]>(
    [],
  );

  const [filteredTokens, setFilteredTokens] = useState<NativeAndErc20Token[]>(
    [],
  );

  const [tokenFilter, setTokenFilter] = useState('');

  const [emptyCardState, setEmptyCardState] = useState<{
    ready: boolean;
    showCard: boolean;
  }>({ ready: false, showCard: false });
  const isMountedRef = useRef(false);

  const getTokenWithChainMainTokenInfo = (
    token: NativeAndErc20Token,
  ): NativeAndErc20Token => {
    if (token.tokenInfo.type !== EVMSmartContractType.NATIVE) {
      return token;
    }
    return {
      ...token,
      tokenInfo: {
        ...token.tokenInfo,
        name: chain.name,
        symbol: chain.mainToken,
        logo: chain.logo ?? token.tokenInfo.logo,
      },
    };
  };

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const [customTokens, hiddenAutoDetectedTokenAddresses] = await Promise.all([
        EvmTokensUtils.getCustomTokens(chain, activeAccount.wallet.address),
        EvmAutoDetectedTokenVisibilityUtils.getHiddenAutoDetectedTokenAddresses(
          chain.chainId,
        ),
      ]);
      const customTokenAddresses = customTokens
        .filter((token) => token.type === EVMSmartContractType.ERC20)
        .map((token) => token.address);
      const tokens: NativeAndErc20Token[] =
        (await EvmTokensUtils.filterTokensBasedOnSettings(
          activeAccount.nativeAndErc20Tokens.value,
          {
            customTokenAddresses,
            hiddenAutoDetectedTokenAddresses,
          },
        )) as NativeAndErc20Token[];
      const sortedTokens = EvmTokensUtils.sortTokens(
        tokens.map(getTokenWithChainMainTokenInfo),
      );
      if (!cancelled) {
        setFilteredTokens(sortedTokens);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [
    activeAccount.nativeAndErc20Tokens,
    activeAccount.wallet.address,
    chain,
    chain.chainId,
  ]);

  useEffect(() => {
    const q = tokenFilter.trim().toLowerCase();
    setDisplayedTokens(
      filteredTokens.filter((token) => {
        if (!q) {
          return true;
        }
        const nameMatch = token.tokenInfo.name?.toLowerCase().includes(q);
        const symbolMatch = token.tokenInfo.symbol?.toLowerCase().includes(q);
        return Boolean(nameMatch || symbolMatch);
      }),
    );
  }, [filteredTokens, tokenFilter]);

  useEffect(() => {
    let cancelled = false;

    const refreshEmptyCard = async () => {
      if (!chain.manualDiscoverAvailable && !chain.addTokensManually) {
        if (!cancelled) {
          setEmptyCardState({ ready: true, showCard: false });
        }
        return;
      }

      const [customTokens, hidden] = await Promise.all([
        EvmTokensUtils.getCustomTokens(chain, activeAccount.wallet.address),
        isCustomErc20EmptyCardHiddenForChain(chain.chainId),
      ]);

      if (cancelled) {
        return;
      }

      const customErc20Count = customTokens.filter(
        (t) => t.type === EVMSmartContractType.ERC20,
      ).length;

      setEmptyCardState({
        ready: true,
        showCard: customErc20Count === 0 && !hidden,
      });
    };

    void refreshEmptyCard();

    return () => {
      cancelled = true;
    };
  }, [
    chain,
    chain.chainId,
    chain.manualDiscoverAvailable,
    chain.addTokensManually,
    activeAccount.wallet.address,
    activeAccount.nativeAndErc20Tokens.loading,
  ]);

  const openCustomTokensPage = () => {
    navigateTo(EvmScreen.EVM_CUSTOM_TOKENS_PAGE);
  };

  const handleHideEmptyCard = async () => {
    await setCustomErc20EmptyCardHiddenForChain(chain.chainId);
    if (isMountedRef.current) {
      setEmptyCardState((prev) => ({ ...prev, showCard: false }));
    }
  };

  return (
    <>
      {!activeAccount.nativeAndErc20Tokens.loading && (
        <>
          <SeparatorWithFilter
            setFilterValue={setTokenFilter}
            filterValue={tokenFilter}
            rightAction={{
              icon: SVGIcons.WALLET_SETTINGS,
              onClick: openCustomTokensPage,
            }}
            filterDisabled={
              activeAccount.nativeAndErc20Tokens.value.length === 0
            }
          />
          {emptyCardState.ready && emptyCardState.showCard && (
            <Card className="evm-custom-erc20-empty-card">
              <p
                className="evm-custom-erc20-empty-card__message"
                dangerouslySetInnerHTML={{
                  __html: HtmlUtils.getSafeI18nHtml(
                    'evm_custom_erc20_empty_card_message',
                  ),
                }}></p>
              <button
                type="button"
                className="evm-custom-erc20-empty-card__hide"
                onClick={() => void handleHideEmptyCard()}>
                {I18nUtils.getMessage('evm_custom_erc20_empty_card_hide')}
              </button>
            </Card>
          )}
          {Boolean(tokenFilter.trim()) &&
            displayedTokens.length === 0 &&
            filteredTokens.length > 0 && (
              <div className="empty-history-panel evm-wallet-tokens-filter-empty-panel">
                <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
                <span className="text">
                  {I18nUtils.getMessage('evm_wallet_tokens_filter_no_results')}
                </span>
              </div>
            )}
          {displayedTokens.map((token, index) => (
            <EVMWalletInfoSectionItemComponent
              key={`${token.tokenInfo.name}-${index}`}
              token={token}
              mainValueLabel={token.tokenInfo.symbol}
              mainValue={token.shortFormattedBalance}
              mainValueSubLabel={token.tokenInfo.name}
            />
          ))}
        </>
      )}

      {activeAccount.nativeAndErc20Tokens.loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </>
  );
};

const connector = connect(null, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmWalletTokensComponent = connector(EvmWalletTokensInner);
