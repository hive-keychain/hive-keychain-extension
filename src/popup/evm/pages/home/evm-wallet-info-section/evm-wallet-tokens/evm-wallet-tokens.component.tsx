import { SVGIcons } from '@common-ui/icons.enum';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  EvmAddCustomAssetPopup,
  EvmCustomErc20FormData,
} from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-add-custom-asset-popup.component';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';

interface Props {
  chain: EvmChain;
  activeAccount: EvmActiveAccount;
  reloadEvmActiveAccount: () => Promise<void>;
}

export const EvmWalletTokensComponent = ({
  chain,
  activeAccount,
  reloadEvmActiveAccount,
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
    const sortedTokens = EvmTokensUtils.sortTokens(tokens);
    setFilteredTokens(sortedTokens);
    setDisplayedTokens(sortedTokens);
  };

  const openAddCustomTokenPanel = () => {
    setShowAddCustomTokenPopup(true);
  };

  const saveCustomToken = async (form: EvmCustomErc20FormData) => {
    await EvmTokensUtils.addCustomToken(chain, activeAccount.wallet.address, {
      address: form.contractAddress,
      type: EVMSmartContractType.ERC20,
      metadata: {
        erc20: {
          name: form.name,
          symbol: form.symbol,
          decimals: form.decimals,
          logo: form.logo,
        },
      },
    });
    setShowAddCustomTokenPopup(false);
    await reloadEvmActiveAccount();
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
                    onClick: openAddCustomTokenPanel,
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
        <EvmAddCustomAssetPopup
          chain={chain}
          mode="erc20"
          walletAddress={activeAccount.wallet.address}
          existingAddresses={activeAccount.nativeAndErc20Tokens.value
            .filter((token) => token.tokenInfo.type === EVMSmartContractType.ERC20)
            .map((token) => token.tokenInfo.contractAddress)}
          onClose={() => setShowAddCustomTokenPopup(false)}
          onSave={saveCustomToken}
        />
      )}

      {activeAccount.nativeAndErc20Tokens.loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </>
  );
};
