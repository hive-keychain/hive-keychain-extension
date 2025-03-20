import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EVMWalletInfoSectionItemComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-info-section-item/evm-wallet-info-section-item.component';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import React, { useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';

interface EvmWalletInfoSectionProps {
  activeAccount: EvmActiveAccount;
  prices: EvmPrices;
}

enum EvmDisplayedPage {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  // ERC1155 = 'ERC1155',
}

const WalletInfoSection = ({
  activeAccount,
  prices,
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
              .filter(
                (token) =>
                  (token.tokenInfo.type === EVMTokenType.NATIVE ||
                    !token.tokenInfo.possibleSpam) &&
                  token.tokenInfo.type !== EVMTokenType.ERC721,
              )
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
          <div className="nft-gallery">
            {activeAccount.erc721Tokens
              .filter((tokens) => tokens.tokenInfo.type === EVMTokenType.ERC721)
              .slice(0, 4)
              .map((token) => (
                <div className="nft-collection">
                  <div className="nft-collection-name">
                    {token.tokenInfo.name}
                  </div>
                  <div className="nft-collection-preview">
                    <div className="nft-preview-container">
                      {token.collection.map((collectionItem) => (
                        <CustomTooltip
                          message={collectionItem.metadata.name}
                          skipTranslation>
                          <img
                            className="nft-preview"
                            src={collectionItem.metadata.image}
                          />
                        </CustomTooltip>
                      ))}
                    </div>
                    <SVGIcon
                      className="go-to-icon"
                      icon={SVGIcons.GLOBAL_ARROW}
                    />
                  </div>
                </div>
              ))}
          </div>
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
