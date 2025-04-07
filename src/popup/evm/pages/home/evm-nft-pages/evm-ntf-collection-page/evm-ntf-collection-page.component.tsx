import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmNftCollectionComponent } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmNftCollectionPage = ({
  collection,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: collection.tokenInfo.name,
      isBackButtonEnabled: true,
      skipTitleTranslation: true,
    });
  }, []);

  return (
    <EvmNftCollectionComponent
      nftList={collection.collection.map((collectionItem) => {
        return {
          item: collectionItem,
          collection: collection,
        };
      })}
      onClick={(item) => console.log(item)}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    collection: state.navigation.params.collection as EvmErc721Token,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftCollectionPageComponent = connector(EvmNftCollectionPage);
