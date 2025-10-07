import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
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

  const [showAddCustomTokenPopup, setShowAddCustomTokenPopup] = useState(false);

  useEffect(() => {
    console.log(activeAccount.nativeAndErc20Tokens);
    init();
  }, [activeAccount.nativeAndErc20Tokens]);

  const init = async () => {
    const tokens: NativeAndErc20Token[] =
      (await EvmTokensUtils.filterTokensBasedOnSettings(
        activeAccount.nativeAndErc20Tokens.value,
      )) as NativeAndErc20Token[];
    const sortedTokens = EvmTokensUtils.sortTokens(tokens, prices);
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
          {displayedTokens.map((token, index) => (
            <EVMWalletInfoSectionItemComponent
              key={`${token.tokenInfo.name}-${index}`}
              token={token}
              mainValueLabel={token.tokenInfo.symbol}
              mainValue={token.shortFormattedBalance}
              mainValueSubLabel={token.tokenInfo.name}
            />
          ))}
          {!activeAccount.nativeAndErc20Tokens.loading &&
            chain.addTokensManually && (
              <div
                className="wallet-info-row add-custom-tokens"
                onClick={openAddCustomTokenPanel}>
                {chrome.i18n.getMessage('evm_add_custom_token')}
              </div>
            )}
          {!activeAccount.nativeAndErc20Tokens.loading &&
            chain.manualDiscoverAvailable && (
              <div
                className="wallet-info-row add-custom-tokens"
                onClick={() => manualDiscoverErc20Tokens()}>
                {chrome.i18n.getMessage('evm_add_manually_discover')}
              </div>
            )}
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
