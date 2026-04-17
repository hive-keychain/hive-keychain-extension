import { Card } from '@common-ui/card/card.component';
import { SVGIcons } from '@common-ui/icons.enum';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import {
  isCustomErc20EmptyCardHiddenForChain,
  setCustomErc20EmptyCardHiddenForChain,
} from '@popup/evm/utils/evm-custom-erc20-empty-card.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';

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

  useEffect(() => {
    init();
  }, [activeAccount.nativeAndErc20Tokens]);

  useEffect(() => {
    if (filteredTokens) {
      setDisplayedTokens(
        filteredTokens.filter(
          (token) =>
            token.tokenInfo.name
              ?.toLowerCase()
              .includes(tokenFilter.toLowerCase()) ||
            token.tokenInfo.symbol
              ?.toLowerCase()
              .includes(tokenFilter.toLowerCase()),
        ),
      );
    }
  }, [tokenFilter]);

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

  const init = async () => {
    const tokens: NativeAndErc20Token[] =
      (await EvmTokensUtils.filterTokensBasedOnSettings(
        activeAccount.nativeAndErc20Tokens.value,
      )) as NativeAndErc20Token[];
    const sortedTokens = EvmTokensUtils.sortTokens(tokens);
    setFilteredTokens(sortedTokens);
    setDisplayedTokens(sortedTokens);
  };

  const openCustomTokensPage = () => {
    navigateTo(EvmScreen.EVM_CUSTOM_TOKENS_PAGE);
  };

  const handleHideEmptyCard = async () => {
    await setCustomErc20EmptyCardHiddenForChain(chain.chainId);
    setEmptyCardState((prev) => ({ ...prev, showCard: false }));
  };

  const canManageCustomTokens =
    chain.manualDiscoverAvailable || chain.addTokensManually;

  return (
    <>
      {!activeAccount.nativeAndErc20Tokens.loading && (
        <>
          <SeparatorWithFilter
            setFilterValue={setTokenFilter}
            filterValue={tokenFilter}
            rightAction={
              canManageCustomTokens
                ? {
                    icon: SVGIcons.WALLET_SETTINGS,
                    onClick: openCustomTokensPage,
                  }
                : undefined
            }
            filterDisabled={
              activeAccount.nativeAndErc20Tokens.value.length === 0
            }
          />
          {emptyCardState.ready && emptyCardState.showCard && (
            <Card className="evm-custom-erc20-empty-card">
              <button
                type="button"
                className="evm-custom-erc20-empty-card__hide"
                onClick={() => void handleHideEmptyCard()}>
                {chrome.i18n.getMessage('evm_custom_erc20_empty_card_hide')}
              </button>
              <p className="evm-custom-erc20-empty-card__message">
                {chrome.i18n.getMessage('evm_custom_erc20_empty_card_message')}
              </p>
            </Card>
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
