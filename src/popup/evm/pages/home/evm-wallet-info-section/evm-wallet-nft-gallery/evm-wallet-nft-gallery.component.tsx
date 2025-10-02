import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import {
  EvmActiveAccount,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletNftPreviewComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-preview/evm-wallet-nft-preview.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
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
  chain: EvmChain;
  manualDiscoverNfts: () => void;
}

export const EvmWalletNftGalleryComponent = ({
  activeAccount,
  chain,
  onClickOnNftPreview,
  manualDiscoverNfts,
}: Props) => {
  const [other, setOther] = useState<EvmErc721Token[]>([]);

  useEffect(() => {
    const otherTokens = [];
    for (const token of activeAccount.nfts.value) {
      if (token.collection.length === 1) {
        otherTokens.push(token);
      }
    }
    setOther(otherTokens);
  }, []);

  return (
    <div className="nft-gallery">
      {!activeAccount.nfts.loading &&
        activeAccount.nfts.value
          .filter((token) => token.collection.length > 1)
          .sort((tokenA, tokenB) =>
            tokenA.tokenInfo.name > tokenB.tokenInfo.name ? 1 : -1,
          )
          .map((token, index) => (
            <React.Fragment key={index}>
              <EvmWalletNftPreviewComponent
                token={token}
                onClick={() =>
                  onClickOnNftPreview(token, EvmScreen.EVM_NFT_COLLECTION_PAGE)
                }
              />
            </React.Fragment>
          ))}

      {!activeAccount.nfts.loading && other.length > 0 && (
        <div
          className="nft-collection-preview-card"
          onClick={() =>
            onClickOnNftPreview(other, EvmScreen.EVM_NFT_ALL_NFTS_PAGE)
          }
          key={'nft-preview-card-other'}>
          <div className="nft-collection-name-panel">
            <span className="nft-collection-name">
              {chrome.i18n.getMessage('global_other')}
            </span>
          </div>
          <div className="nft-collection-preview">
            <div className="nft-preview-container">
              {other.map((otherToken, index) => (
                <React.Fragment
                  key={`${otherToken.tokenInfo.contractAddress}-${index}`}>
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
      {!activeAccount.nfts.loading && chain.manualDiscoverAvailable && (
        <div
          className="wallet-info-row add-custom-tokens"
          onClick={() => manualDiscoverNfts()}>
          {chrome.i18n.getMessage('evm_add_manually_discover')}
        </div>
      )}
      {activeAccount.nfts.loading && <RotatingLogoComponent />}
      {activeAccount.nfts.value.length === 0 && (
        <div className="no-nfts-found">
          <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
          <span className="text">
            {chrome.i18n.getMessage('evm_no_nfts_found')}
          </span>
        </div>
      )}
    </div>
  );
};
