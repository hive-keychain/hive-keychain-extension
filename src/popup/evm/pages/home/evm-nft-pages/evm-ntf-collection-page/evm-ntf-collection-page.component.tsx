import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmNftCollectionComponent,
  EvmNftCollectionListItem,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmNftCollectionPage = ({
  collection,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: collection.tokenInfo.name,
      isBackButtonEnabled: true,
      skipTitleTranslation: true,
    });
  }, []);

  const goToSendNftPage = (item: EvmNftCollectionListItem) => {
    navigateToWithParams(EvmScreen.EVM_NFT_TRANSFER_PAGE, {
      collectionItem: item,
    });
  };

  return (
    <EvmNftCollectionComponent
      nftList={collection.collection.map((collectionItem) => {
        return {
          item: collectionItem,
          collection: collection,
        };
      })}
      onSendClick={(item) => goToSendNftPage(item)}
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
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftCollectionPageComponent = connector(EvmNftCollectionPage);
