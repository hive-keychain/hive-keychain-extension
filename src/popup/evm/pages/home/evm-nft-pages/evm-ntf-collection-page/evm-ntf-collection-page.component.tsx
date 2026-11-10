import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmNftCollectionPage = ({
  collection,
  chain,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
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
    });
  }, [collectionTitle, setTitleContainerProperties]);

  const openNft = (listItem: EvmNftCollectionListItem) => {
    navigateToWithParams(EvmScreen.EVM_NFT_DETAILS_PAGE, {
      collection,
      nftId: listItem.item.id,
    });
  };

  const openSend = (listItem: EvmNftCollectionListItem) => {
    navigateToWithParams(EvmScreen.EVM_NFT_TRANSFER_PAGE, {
      collection: listItem.collection,
      nftId: listItem.item.id,
    });
  };

  return (
    <div className="evm-nft-screen">
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
        showFilter={false}
        defaultSort="tokenId"
        onSelectNft={openNft}
        onSendNft={openSend}
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
