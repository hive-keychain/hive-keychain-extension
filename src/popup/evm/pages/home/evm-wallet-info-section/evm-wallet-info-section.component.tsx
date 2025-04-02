import {
  EvmActiveAccount,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmWalletNftGalleryComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-gallery.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
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
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  // ERC1155 = 'ERC1155',
}

const WalletInfoSection = ({
  activeAccount,
  prices,
  onClickOnNftPreview,
}: EvmWalletInfoSectionProps) => {
  const [displayedSection, setDisplayedSection] = useState<EvmDisplayedPage>(
    EvmDisplayedPage.ERC20,
  );

  const getDisplayedSection = () => {
    switch (displayedSection) {
      case EvmDisplayedPage.ERC20: {
        return (
          <>
            {EvmTokensUtils.sortTokens(
              activeAccount.nativeAndErc20Tokens,
              prices,
            )
              // .filter(
              //   (token) =>
              //     (token.tokenInfo.type === EVMSmartContractType.NATIVE ||
              //       !token.tokenInfo.possibleSpam) &&
              //     token.tokenInfo.type !== EVMSmartContractType.ERC721,
              // )
              .map((token, index) => (
                <EVMWalletInfoSectionItemComponent
                  key={`${token.tokenInfo.name}-${index}`}
                  token={token}
                  mainValueLabel={token.tokenInfo.symbol}
                  mainValue={token.formattedBalance}
                  mainValueSubLabel={token.tokenInfo.name}
                />
              ))}
          </>
        );
      }
      case EvmDisplayedPage.ERC721: {
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
                  label: EvmDisplayedPage.ERC20,
                  value: EvmDisplayedPage.ERC20,
                  skipLabelTranslation: true,
                },
                {
                  label: EvmDisplayedPage.ERC721,
                  value: EvmDisplayedPage.ERC721,
                  skipLabelTranslation: true,
                },
              ]}
              id="tabs"
            />
            {getDisplayedSection()}
          </>
        )}
        {!activeAccount && <RotatingLogoComponent />}
      </div>
    </div>
  );
};

export const EvmWalletInfoSectionComponent = WalletInfoSection;
