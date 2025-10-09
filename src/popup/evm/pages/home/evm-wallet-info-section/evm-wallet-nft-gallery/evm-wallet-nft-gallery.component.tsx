import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
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
  const [displayedCollections, setDisplayedCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();
  const [filteredCollections, setFilteredCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();

  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    if (!activeAccount.nfts.loading) {
      init();
    }
  }, [activeAccount.nfts]);

  useEffect(() => {
    if (filteredCollections) {
      setDisplayedCollections(
        filteredCollections.filter(
          (collection) =>
            collection.tokenInfo.name
              ?.toLowerCase()
              .includes(filterValue.toLowerCase()) ||
            collection.tokenInfo.symbol
              ?.toLowerCase()
              .includes(filterValue.toLowerCase()),
        ),
      );
    }
  }, [filterValue]);

  const init = async () => {
    const acceptedTokens = (await EvmTokensUtils.filterTokensBasedOnSettings(
      activeAccount.nfts.value,
    )) as (EvmErc721Token | EvmErc1155Token)[];
    setFilteredCollections(acceptedTokens);
    setDisplayedCollections(acceptedTokens);
  };

  return (
    <div className="nft-gallery">
      {displayedCollections && activeAccount.nfts.value.length > 0 && (
        <>
          <SeparatorWithFilter
            setFilterValue={setFilterValue}
            filterValue={filterValue}
          />
          <FlatList
            list={displayedCollections}
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
        </>
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
