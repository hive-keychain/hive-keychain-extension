import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

export const EvmNftAllCollectionsPage = ({
  collections,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>();

  const [selectedCollection, setSelectedCollection] =
    useState<EvmErc721Token>();

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
  return (
    <>
      {allCollections && (
        <EvmNftCollectionComponent
          additionalClass="evm-nft-all-collections"
          nftList={allCollections}
          onClick={(item) => console.log(item)}
        />
      )}
    </>

    // <div className="evm-nft-collection-page ">
    //   <FormContainer>
    //     <div className="nft-list">
    //       {collections.map((collection) =>
    //         collection.collection.map((item, itemIndex) => (
    //           <EvmNftDetails
    //             nft={item}
    //             collection={collection}
    //             onClick={() => {
    //               setSelectedNftIndex(itemIndex);
    //               setSelectedCollection(collection);
    //             }}
    //             expanded={itemIndex === selectedNftIndex}
    //           />
    //         )),
    //       )}
    //     </div>
    //   </FormContainer>
    // </div>
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftAllCollectionsPageComponent = connector(
  EvmNftAllCollectionsPage,
);
