import {
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmNftDetails } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';

export const EvmNftAllCollections = ({
  collections,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [selectedNft, setSelectedNft] =
    useState<EvmErc721TokenCollectionItem>();
  const [selectedCollection, setSelectedCollection] =
    useState<EvmErc721Token>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_all_nft_collections',
      isBackButtonEnabled: true,
    });
  }, []);
  return (
    <div className="evm-nft-collection-page evm-nft-all-collections">
      <FormContainer>
        {selectedNft && selectedCollection && (
          <EvmNftDetails nft={selectedNft} collection={selectedCollection} />
        )}

        <div className="nft-list">
          {collections.map((collection) =>
            collection.collection.map((item, itemIndex) => (
              <div
                key={`item-${itemIndex}`}
                className={`nft-collection-item `}
                onClick={() => {
                  setSelectedNft(item);
                  setSelectedCollection(collection);
                }}>
                <img src={item.metadata.image} />
                <div className="name">{item.metadata.name}</div>
              </div>
            )),
          )}
        </div>
      </FormContainer>
    </div>
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

export const EvmNftAllCollectionsComponent = connector(EvmNftAllCollections);
