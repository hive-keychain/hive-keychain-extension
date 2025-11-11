import { SVGIcons } from '@common-ui/icons.enum';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmAddCustomTokenPopup } from '@popup/evm/pages/home/evm-add-custom-token-popup/evm-add-custom-token-popup.component';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';

interface Props {
  chain: EvmChain;
  prices: EvmPrices;
  activeAccount: EvmActiveAccount;
  manualDiscoverErc20Tokens: () => void;
}

export const EvmWalletTokensComponent = ({
  chain,
  prices,
  activeAccount,
  manualDiscoverErc20Tokens,
}: Props) => {
  const [displayedTokens, setDisplayedTokens] = useState<NativeAndErc20Token[]>(
    [],
  );

  const [filteredTokens, setFilteredTokens] = useState<NativeAndErc20Token[]>(
    [],
  );

  const [showAddCustomTokenPopup, setShowAddCustomTokenPopup] = useState(false);

  const [tokenFilter, setTokenFilter] = useState('');

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

  const init = async () => {
    const tokens: NativeAndErc20Token[] =
      (await EvmTokensUtils.filterTokensBasedOnSettings(
        activeAccount.nativeAndErc20Tokens.value,
      )) as NativeAndErc20Token[];
    const sortedTokens = EvmTokensUtils.sortTokens(tokens, prices);
    setFilteredTokens(sortedTokens);
    setDisplayedTokens(sortedTokens);
  };

  const openAddCustomTokenPanel = () => {
    setShowAddCustomTokenPopup(true);
  };

  const saveCustomToken = (tokenAddress: string) => {
    setShowAddCustomTokenPopup(false);
    // TODO: save custom token
  };

  return (
    <>
      {!activeAccount.nativeAndErc20Tokens.loading && (
        <>
          <SeparatorWithFilter
            setFilterValue={setTokenFilter}
            filterValue={tokenFilter}
            rightAction={
              chain.manualDiscoverAvailable || chain.addTokensManually
                ? {
                    icon: SVGIcons.WALLET_ADD,
                    onClick: chain.manualDiscoverAvailable
                      ? manualDiscoverErc20Tokens
                      : openAddCustomTokenPanel,
                  }
                : undefined
            }
            filterDisabled={
              activeAccount.nativeAndErc20Tokens.value.length === 0
            }
          />
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
      {showAddCustomTokenPopup && (
        <EvmAddCustomTokenPopup
          chain={chain}
          onClose={() => setShowAddCustomTokenPopup(false)}
          onSave={saveCustomToken}
        />
      )}

      {activeAccount.nativeAndErc20Tokens.loading && <RotatingLogoComponent />}
    </>
  );
};
