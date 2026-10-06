import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmNftOptionsPanel } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-options-menu/evm-nft-options-menu.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';

const EvmNftCollectionPage = ({
  collection,
  chain,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const contractAddress = collection.tokenInfo.contractAddress;
  const formattedAddress = EvmFormatUtils.formatAddress(contractAddress);
  const collectionTitle = collection.tokenInfo.name?.trim() || formattedAddress;
  const showContractAddress =
    collectionTitle.toLowerCase() !== formattedAddress.toLowerCase();
  const explorerUrl = EvmNftDisplayUtils.getNftContractExplorerUrl(
    chain?.blockExplorer?.url,
    contractAddress,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: collectionTitle,
      isBackButtonEnabled: true,
      skipTitleTranslation: true,
      rightAction: {
        icon: SVGIcons.GLOBAL_MENU_DOTS,
        callback: () => setMenuOpen((open) => !open),
        dataTestId: 'nft-collection-menu',
      },
    });
  }, [collectionTitle, setTitleContainerProperties]);

  const openNft = (listItem: EvmNftCollectionListItem) => {
    navigateToWithParams(EvmScreen.EVM_NFT_DETAILS_PAGE, {
      collection,
      nftId: listItem.item.id,
    });
  };

  const menuItems = [
    {
      label: 'html_popup_copy',
      testId: 'nft-collection-menu-copy',
      onClick: () => {
        void copyTextWithToast(contractAddress, COPY_GENERIC_MESSAGE_KEY);
      },
    },
    ...(explorerUrl
      ? [
          {
            label: 'portfolio_history_view_on_explorer',
            testId: 'nft-collection-menu-explorer',
            onClick: () => {
              chrome.tabs.create({ url: explorerUrl });
            },
          },
        ]
      : []),
  ];

  return (
    <div className="evm-nft-screen">
      {menuOpen && (
        <EvmNftOptionsPanel
          className="nft-page-menu"
          items={menuItems}
          onClose={() => setMenuOpen(false)}
        />
      )}
      <EvmNftCollectionComponent
        nftList={collection.collection.map((collectionItem) => {
          return {
            item: collectionItem,
            collection: collection,
          };
        })}
        contractAddress={contractAddress}
        formattedContractAddress={
          showContractAddress ? formattedAddress : undefined
        }
        explorerUrl={explorerUrl}
        onSelectNft={openNft}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    collection: state.navigation.stack[0].params.collection as EvmErc721Token,
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftCollectionPageComponent = connector(EvmNftCollectionPage);
