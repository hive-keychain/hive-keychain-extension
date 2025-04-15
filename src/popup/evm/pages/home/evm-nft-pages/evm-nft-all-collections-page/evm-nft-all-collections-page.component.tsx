import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

export const EvmNftAllCollectionsPage = ({
  collections,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const [allCollections, setAllCollections] =
    useState<EvmNftCollectionListItem[]>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_all_nft_collections',
      isBackButtonEnabled: true,
    });
    const list: EvmNftCollectionListItem[] = [];
    for (const collection of collections) {
      list.push({
        collection: collection,
        item: collection.collection[0],
      });
    }

    setAllCollections(list);
  }, []);

  const goToSendNftPage = (item: EvmNftCollectionListItem) => {
    navigateToWithParams(EvmScreen.EVM_NFT_TRANSFER_PAGE, {
      collectionItem: item,
    });
  };
  return (
    <>
      {allCollections && (
        <EvmNftCollectionComponent
          additionalClass="evm-nft-all-collections"
          nftList={allCollections}
          onSendClick={(item) => goToSendNftPage(item)}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    collections: state.navigation.params.collections as EvmErc721Token[],
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftAllCollectionsPageComponent = connector(
  EvmNftAllCollectionsPage,
);
