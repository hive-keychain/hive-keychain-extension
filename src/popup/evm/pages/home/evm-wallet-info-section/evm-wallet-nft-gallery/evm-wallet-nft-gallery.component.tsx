import {
  EvmActiveAccount,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletNftPreviewComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-preview/evm-wallet-nft-preview.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  activeAccount: EvmActiveAccount;
  onClickOnNftPreview: (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => void;
}

export const EvmWalletNftGalleryComponent = ({
  activeAccount,
  onClickOnNftPreview,
}: Props) => {
  const [other, setOther] = useState<EvmErc721Token[]>([]);

  useEffect(() => {
    const otherTokens = [];
    for (const token of activeAccount.erc721Tokens) {
      if (token.collection.length === 1) {
        otherTokens.push(token);
      }
    }
    setOther(otherTokens);

    console.log(otherTokens);
  }, []);

  return (
    <div className="nft-gallery">
      {activeAccount.erc721Tokens
        .filter((token) => token.collection.length > 1)
        .map((token) => (
          <EvmWalletNftPreviewComponent
            token={token}
            onClick={() =>
              onClickOnNftPreview(token, EvmScreen.EVM_NFT_COLLECTION_PAGE)
            }
          />
        ))}

      {other.length > 0 && (
        <div
          className="nft-collection-preview-card"
          onClick={() =>
            onClickOnNftPreview(other, EvmScreen.EVM_NFT_ALL_NFTS_PAGE)
          }>
          <div className="nft-collection-name">
            {chrome.i18n.getMessage('global_other')}
          </div>
          <div className="nft-collection-preview">
            <div className="nft-preview-container">
              {other.map((otherToken, index) => (
                <React.Fragment
                  key={`${otherToken.tokenInfo.address}-${index}`}>
                  <CustomTooltip
                    message={otherToken.collection[0].metadata.name}
                    skipTranslation>
                    <img
                      className="nft-preview"
                      src={otherToken.collection[0].metadata.image}
                    />
                  </CustomTooltip>
                </React.Fragment>
              ))}
            </div>
            <SVGIcon className="go-to-icon" icon={SVGIcons.GLOBAL_ARROW} />
          </div>
        </div>
      )}
    </div>
  );
};
