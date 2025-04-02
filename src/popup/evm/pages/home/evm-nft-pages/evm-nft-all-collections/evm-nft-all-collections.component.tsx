import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
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
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>();

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
        <div className="nft-list">
          {collections.map((collection) =>
            collection.collection.map((item, itemIndex) => (
              <EvmNftDetails
                nft={item}
                collection={collection}
                onClick={() => {
                  setSelectedNftIndex(itemIndex);
                  setSelectedCollection(collection);
                }}
                expanded={itemIndex === selectedNftIndex}
              />
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
