import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmWalletNftPreviewComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-preview/evm-wallet-nft-preview.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import FlatList from 'flatlist-react';
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
  const [filteredCollections, setFilteredCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();

  useEffect(() => {
    if (!activeAccount.nfts.loading) {
      init();
    }
  }, [activeAccount.nfts]);

  const init = async () => {
    const acceptedTokens = (await EvmTokensUtils.filterTokensBasedOnSettings(
      activeAccount.nfts.value,
    )) as (EvmErc721Token | EvmErc1155Token)[];
    setFilteredCollections(acceptedTokens);
  };

  return (
    <div className="nft-gallery">
      {filteredCollections && (
        <FlatList
          list={filteredCollections}
          renderItem={(token: EvmErc721Token | EvmErc1155Token) => (
            <EvmWalletNftPreviewComponent
              token={token}
              onClick={() =>
                onClickOnNftPreview(token, EvmScreen.EVM_NFT_COLLECTION_PAGE)
              }
            />
          )}
          renderOnScroll
        />
      )}

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
              {other.slice(0, 4).map((otherToken, index) => (
                <React.Fragment
                  key={`${otherToken.tokenInfo.contractAddress}-${index}`}>
                  <CustomTooltip
                    message={otherToken.collection[0].metadata.name}
                    skipTranslation>
                    <img
                      className="nft-preview"
                      src={otherToken.collection[0].metadata.image}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src =
                          '/assets/images/placeholder-image.svg';
                      }}
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
      {!activeAccount.nfts.loading && activeAccount.nfts.value.length === 0 && (
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
