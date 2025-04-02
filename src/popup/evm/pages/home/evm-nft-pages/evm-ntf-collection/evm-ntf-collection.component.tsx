import { EvmErc721Token } from '@popup/evm/interfaces/active-account.interface';
import { EvmNftDetails } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { useBackToTop } from 'src/hooks/back-to-top.hook';

const EvmNftCollection = ({
  collection,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>();

  const backToTopHook = useBackToTop();

  useEffect(() => {
    setTitleContainerProperties({
      title: collection.tokenInfo.name,
      isBackButtonEnabled: true,
      skipTitleTranslation: true,
    });
  }, []);

  return (
    <div className="evm-nft-collection-page">
      <FormContainer>
        <div className="nft-list" ref={backToTopHook.list}>
          {/* {selectedNft && collection && (
            <EvmNftDetails nft={selectedNft} collection={collection} />
          )} */}
          {collection.collection.map((item, index) => (
            <EvmNftDetails
              nft={item}
              collection={collection}
              onClick={() => setSelectedNftIndex(index)}
              expanded={index === selectedNftIndex}
            />
            // <div
            //   key={`item-${index}`}
            //   className={`nft-collection-item `}
            //   onClick={() => {
            //     setSelectedNft(item);
            //   }}>
            //   <img src={item.metadata.image} />
            //   <div className="item-information">
            //     <div className="name">{item.metadata.name}</div>
            //     <div className="description">{item.metadata.description}</div>
            //   </div>
            // </div>
          ))}
          {backToTopHook.displayScrollToTop && (
            <BackToTopButton element={backToTopHook.list} />
          )}
        </div>
      </FormContainer>
    </div>
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

export const EvmNftCollectionComponent = connector(EvmNftCollection);
