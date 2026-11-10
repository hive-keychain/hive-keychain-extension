import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmNftDetails } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';

const findCollectionItem = (
  collection: EvmErc721Token,
  nftId: string | undefined,
) => collection.collection.find((item) => item.id === nftId);

const EvmNftDetailsPage = ({
  collection,
  nftId,
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const nft = findCollectionItem(collection, nftId);
  const title = nft
    ? EvmNftDisplayUtils.getNftDisplayName(nft, collection.tokenInfo.name)
    : '';

  useEffect(() => {
    if (!title) {
      return;
    }
    setTitleContainerProperties({
      title,
      isBackButtonEnabled: true,
      skipTitleTranslation: true,
    });
  }, [setTitleContainerProperties, title]);

  if (!nft) {
    return null;
  }

  const openSend = () => {
    navigateToWithParams(EvmScreen.EVM_NFT_TRANSFER_PAGE, {
      collection,
      nftId: nft.id,
    });
  };

  return (
    <div className="evm-nft-details-page">
      <FormContainer>
        <EvmNftDetails nft={nft} collection={collection} onSend={openSend} />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    collection: state.navigation.stack[0].params.collection as EvmErc721Token,
    nftId: state.navigation.stack[0].params.nftId as string | undefined,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNftDetailsPageComponent = connector(EvmNftDetailsPage);
