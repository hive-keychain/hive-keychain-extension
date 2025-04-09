import {
  EvmErc721Token,
  EvmErc721TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmNftDetails } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import React, { useEffect, useState } from 'react';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { useBackToTop } from 'src/hooks/back-to-top.hook';

export interface EvmNftCollectionListItem {
  collection: EvmErc721Token;
  item: EvmErc721TokenCollectionItem;
}

interface Props {
  nftList: EvmNftCollectionListItem[];
  additionalClass?: string;
  onClick: (item: EvmNftCollectionListItem) => void;
}

export const EvmNftCollectionComponent = ({
  nftList,
  additionalClass,
  onClick,
}: Props) => {
  const backToTopHook = useBackToTop();

  const [selectedCollectionListItem, setSelectedCollectionListItem] =
    useState<EvmNftCollectionListItem>();

  const [query, setQuery] = useState<string>('');
  const [filteredItems, setFilteredItems] =
    useState<EvmNftCollectionListItem[]>();

  useEffect(() => {
    setFilteredItems(
      nftList.filter((listItem) => {
        const lowerCaseQuery = query.toLowerCase();
        return (
          listItem.collection.tokenInfo.name
            .toLowerCase()
            .includes(lowerCaseQuery) ||
          listItem.item.metadata.name?.toLowerCase().includes(lowerCaseQuery) ||
          listItem.item.metadata.description?.includes(lowerCaseQuery) ||
          listItem.item.metadata.attributes
            ?.map((attr) => attr.value.toLowerCase())
            .some((attr) => attr.includes(lowerCaseQuery))
        );
      }),
    );
  }, [query]);

  const handleClick = (listItem: EvmNftCollectionListItem) => {
    onClick(listItem);
    setSelectedCollectionListItem(listItem);
  };

  return (
    <div
      className={`evm-nft-collection-page ${
        additionalClass ? additionalClass : ''
      }`}>
      <FormContainer>
        <InputComponent
          value={query}
          type={InputType.TEXT}
          onChange={setQuery}
          placeholder="popup_html_search"
        />
        <div className="nft-list" ref={backToTopHook.list}>
          {filteredItems &&
            filteredItems.map((listItem, index) => (
              <React.Fragment key={index}>
                <EvmNftDetails
                  nft={listItem.item}
                  collection={listItem.collection}
                  onClick={() => handleClick(listItem)}
                  expanded={
                    selectedCollectionListItem?.collection.tokenInfo.address ===
                      listItem.collection.tokenInfo.address &&
                    listItem.item.id === selectedCollectionListItem.item.id
                  }
                />
              </React.Fragment>
            ))}
          {backToTopHook.displayScrollToTop && (
            <BackToTopButton element={backToTopHook.list} />
          )}
        </div>
      </FormContainer>
    </div>
  );
};
