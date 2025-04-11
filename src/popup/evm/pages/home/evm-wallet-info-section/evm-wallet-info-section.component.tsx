import {
  EvmActiveAccount,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletNftGalleryComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-gallery.component';
import { EvmWalletTokensComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-tokens/evm-wallet-tokens.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import React, { useState } from 'react';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';

interface EvmWalletInfoSectionProps {
  activeAccount: EvmActiveAccount;
  prices: EvmPrices;
  onClickOnNftPreview: (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => void;
}

enum EvmDisplayedPage {
  TOKENS = 'tokens',
  NTFS = 'nfts',
}

const WalletInfoSection = ({
  activeAccount,
  prices,
  onClickOnNftPreview,
}: EvmWalletInfoSectionProps) => {
  const [displayedSection, setDisplayedSection] = useState<EvmDisplayedPage>(
    EvmDisplayedPage.TOKENS,
  );

  const getDisplayedSection = () => {
    switch (displayedSection) {
      case EvmDisplayedPage.TOKENS: {
        return (
          <EvmWalletTokensComponent
            prices={prices}
            activeAccount={activeAccount}
          />
        );
      }
      case EvmDisplayedPage.NTFS: {
        return (
          <EvmWalletNftGalleryComponent
            activeAccount={activeAccount}
            onClickOnNftPreview={onClickOnNftPreview}
          />
        );
      }
    }
  };

  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        {prices && activeAccount.nativeAndErc20Tokens && (
          <>
            <SlidingBarComponent
              onChange={setDisplayedSection}
              selectedValue={displayedSection}
              values={[
                {
                  label: `evm_tab_${EvmDisplayedPage.TOKENS}`,
                  value: EvmDisplayedPage.TOKENS,
                },
                {
                  label: `evm_tab_${EvmDisplayedPage.NTFS}`,
                  value: EvmDisplayedPage.NTFS,
                },
              ]}
              id="tabs"
            />
            {getDisplayedSection()}
          </>
        )}
        {!activeAccount.isInitialized && <RotatingLogoComponent />}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
