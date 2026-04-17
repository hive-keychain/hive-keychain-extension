import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { SeparatorWithFilter } from '@common-ui/separator-with-filter/separator-with-filter.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmAddCustomTokenPopup } from '@popup/evm/pages/home/evm-add-custom-token-popup/evm-add-custom-token-popup.component';
import { EvmWalletNftPreviewComponent } from '@popup/evm/pages/home/evm-wallet-info-section/evm-wallet-nft-gallery/evm-wallet-nft-preview/evm-wallet-nft-preview.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
import FlatList from 'flatlist-react';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface Props {
  activeAccount: EvmActiveAccount;
  onClickOnNftPreview: (
    params: EvmErc721Token | EvmErc721Token[],
    screen: EvmScreen,
  ) => void;
  chain: EvmChain;
  loadEvmActiveAccountNfts: (chain: EvmChain, wallet: HDNodeWallet) => void;
}

export const EvmWalletNftGalleryComponent = ({
  activeAccount,
  chain,
  onClickOnNftPreview,
  loadEvmActiveAccountNfts,
}: Props) => {
  const [displayedCollections, setDisplayedCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();
  const [filteredCollections, setFilteredCollections] =
    useState<(EvmErc721Token | EvmErc1155Token)[]>();

  const [filterValue, setFilterValue] = useState('');

  const [showAddCustomTokenPopup, setShowAddCustomTokenPopup] = useState(false);
  const isCustomChainSelected = chain.isCustom === true;

  useEffect(() => {
    if (!activeAccount.nfts.initialized) {
      loadEvmActiveAccountNfts(chain, activeAccount.wallet);
    }
  }, []);

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

  const openAddCustomTokenPanel = () => {
    setShowAddCustomTokenPopup(true);
  };

  const saveCustomToken = (tokenAddress: string) => {
    setShowAddCustomTokenPopup(false);
    // TODO: save custom token
  };

  return (
    <div className="nft-gallery">
      {displayedCollections && !activeAccount.nfts.loading && (
        <>
          {(displayedCollections.length > 0 || isCustomChainSelected) && (
            <SeparatorWithFilter
              setFilterValue={setFilterValue}
              filterValue={filterValue}
              rightAction={
                isCustomChainSelected
                  ? {
                      icon: SVGIcons.WALLET_ADD,
                      onClick: openAddCustomTokenPanel,
                    }
                  : undefined
              }
              filterDisabled={activeAccount.nfts.value.length === 0}
            />
          )}
          <FlatList
            list={displayedCollections}
            renderItem={(token: EvmErc721Token | EvmErc1155Token) => (
              <EvmWalletNftPreviewComponent
                token={token}
                onClick={() =>
                  onClickOnNftPreview(token, EvmScreen.EVM_NFT_COLLECTION_PAGE)
                }
                key={`${token.tokenInfo.contractAddress}`}
              />
            )}
            renderWhenEmpty={() => (
              <div className="no-nfts-found">
                <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
                <span className="text">
                  {chrome.i18n.getMessage('evm_no_nfts_found')}
                </span>
              </div>
            )}
            renderOnScroll
          />
        </>
      )}

      {showAddCustomTokenPopup && (
        <EvmAddCustomTokenPopup
          chain={chain}
          onClose={() => setShowAddCustomTokenPopup(false)}
          onSave={saveCustomToken}
        />
      )}

      {activeAccount.nfts.loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};
