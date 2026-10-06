import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import type { EvmNftCollectionListItem } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import {
  EvmNftTransferFormComponent,
  type EvmNftTransferFormParams,
} from '@popup/evm/pages/home/evm-nft-pages/evm-nft-transfer/evm-nft-transfer.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';

const EvmNftTransferPage = ({
  collection,
  nftId,
  initialFormParams,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const item = collection.collection.find(
    (collectionItem) => collectionItem.id === nftId,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_nft_send_title',
      isBackButtonEnabled: true,
    });
  }, [setTitleContainerProperties]);

  if (!item) {
    return null;
  }

  const collectionItem: EvmNftCollectionListItem = {
    collection,
    item,
  };

  return (
    <div className="evm-nft-transfer-page">
      <FormContainer>
        <EvmNftTransferFormComponent
          collectionItem={collectionItem}
          initialFormParams={initialFormParams}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    collection: state.navigation.stack[0].params.collection as EvmErc721Token,
    nftId: state.navigation.stack[0].params.nftId as string | undefined,
    initialFormParams: state.navigation.stack[0].previousParams
      ?.formParams as EvmNftTransferFormParams | undefined,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftTransferPageComponent = connector(EvmNftTransferPage);
