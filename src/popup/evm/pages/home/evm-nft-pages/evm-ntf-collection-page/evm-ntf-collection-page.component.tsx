import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmNftCollectionComponent } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import type { EvmNftTransferFormParams } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-transfer/evm-nft-transfer.component';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmNftCollectionPage = ({
  collection,
  initialFormParams,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  useEffect(() => {
    const collectionTitle =
      collection.tokenInfo.name?.trim() ||
      EvmFormatUtils.formatAddress(collection.tokenInfo.contractAddress);

    setTitleContainerProperties({
      title: collectionTitle,
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
      initialFormParams={initialFormParams}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    collection: state.navigation.stack[0].params.collection as EvmErc721Token,
    initialFormParams: state.navigation.stack[0].previousParams
      ?.formParams as EvmNftTransferFormParams | undefined,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftCollectionPageComponent = connector(EvmNftCollectionPage);
