import {
  EvmErc721TokenCollectionItem,
  EvmErc1155TokenCollectionItem,
  EvmErc721Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmNftOptionsMenu } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-options-menu/evm-nft-options-menu.component';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import React, { useMemo, useState } from 'react';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import { EvmNftMedia } from 'src/common-ui/evm/nft-media/nft-media.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  COPY_GENERIC_MESSAGE_KEY,
  copyTextWithToast,
} from 'src/common-ui/toast/copy-toast.utils';
import { useBackToTop } from 'src/hooks/back-to-top.hook';
import { I18nUtils } from 'src/utils/i18n.utils';

export interface EvmNftCollectionListItem {
  collection: EvmErc721Token;
  item: EvmErc721TokenCollectionItem | EvmErc1155TokenCollectionItem;
}

type NftGalleryFilter = 'all' | 'multiple';
type NftGallerySort = 'name' | 'tokenId' | 'quantity';

interface Props {
  nftList: EvmNftCollectionListItem[];
  additionalClass?: string;
  contractAddress?: string;
  formattedContractAddress?: string;
  explorerUrl?: string;
  onSelectNft: (listItem: EvmNftCollectionListItem) => void;
}

const compareTokenIds = (left: string, right: string) =>
  left.localeCompare(right, undefined, { numeric: true });

export const EvmNftCollectionComponent = ({
  nftList,
  additionalClass,
  contractAddress,
  formattedContractAddress,
  explorerUrl,
  onSelectNft,
}: Props) => {
  const backToTopHook = useBackToTop();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<NftGalleryFilter>('all');
  const [sort, setSort] = useState<NftGallerySort>('name');

  const visibleItems = useMemo(() => {
    const lowerCaseQuery = query.trim().toLowerCase();
    const matched = nftList.filter((listItem) => {
      const quantity = EvmNftDisplayUtils.getNftOwnedQuantity(listItem.item);
      if (filter === 'multiple' && quantity <= 1) {
        return false;
      }
      if (!lowerCaseQuery) {
        return true;
      }
      return (
        listItem.collection.tokenInfo.name
          ?.toLowerCase()
          .includes(lowerCaseQuery) ||
        listItem.item.id.toLowerCase().includes(lowerCaseQuery) ||
        listItem.item.metadata.name
          ?.toLowerCase()
          .includes(lowerCaseQuery) ||
        listItem.item.metadata.description
          ?.toLowerCase()
          .includes(lowerCaseQuery)
      );
    });

    return [...matched].sort((left, right) => {
      if (sort === 'tokenId') {
        return compareTokenIds(left.item.id, right.item.id);
      }
      if (sort === 'quantity') {
        return (
          EvmNftDisplayUtils.getNftOwnedQuantity(right.item) -
          EvmNftDisplayUtils.getNftOwnedQuantity(left.item)
        );
      }
      return EvmNftDisplayUtils.getNftDisplayName(
        left.item,
        left.collection.tokenInfo.name,
      ).localeCompare(
        EvmNftDisplayUtils.getNftDisplayName(
          right.item,
          right.collection.tokenInfo.name,
        ),
      );
    });
  }, [filter, nftList, query, sort]);

  const copyContractAddress = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!contractAddress) {
      return;
    }
    void copyTextWithToast(contractAddress, COPY_GENERIC_MESSAGE_KEY);
  };

  const openContractInBlockExplorer = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (!explorerUrl) {
      return;
    }
    chrome.tabs.create({ url: explorerUrl });
  };

  return (
    <div
      className={`evm-nft-collection-page ${
        additionalClass ? additionalClass : ''
      }`}>
      <FormContainer>
        {formattedContractAddress && (
          <div className="nft-collection-contract-row">
            <span className="nft-collection-contract">
              {formattedContractAddress}
            </span>
            {contractAddress && (
              <button
                type="button"
                className="nft-collection-contract-action"
                aria-label={I18nUtils.getMessage('html_popup_copy')}
                data-testid="nft-collection-contract-copy"
                onClick={copyContractAddress}>
                <SVGIcon icon={SVGIcons.SELECT_COPY} />
              </button>
            )}
            {explorerUrl && (
              <button
                type="button"
                className="nft-collection-contract-action"
                aria-label={I18nUtils.getMessage(
                  'portfolio_history_view_on_explorer',
                )}
                data-testid="nft-collection-contract-explorer"
                onClick={openContractInBlockExplorer}>
                <SVGIcon icon={SVGIcons.GLOBAL_EXTERNAL_LINK} />
              </button>
            )}
          </div>
        )}
        <div className="nft-gallery-toolbar">
          <InputComponent
            value={query}
            type={InputType.TEXT}
            onChange={setQuery}
            placeholder="evm_nft_search_nft"
            logo={SVGIcons.INPUT_SEARCH}
          />
          <EvmNftOptionsMenu
            triggerLabel="evm_nft_filter"
            active={filter !== 'all'}
            testId="nft-filter-button"
            items={[
              {
                label: 'evm_nft_filter_all',
                selected: filter === 'all',
                testId: 'nft-filter-all',
                onClick: () => setFilter('all'),
              },
              {
                label: 'evm_nft_filter_multiple',
                selected: filter === 'multiple',
                testId: 'nft-filter-multiple',
                onClick: () => setFilter('multiple'),
              },
            ]}
          />
          <EvmNftOptionsMenu
            triggerLabel="evm_nft_sort"
            active={sort !== 'name'}
            testId="nft-sort-button"
            items={[
              {
                label: 'evm_nft_sort_name',
                selected: sort === 'name',
                testId: 'nft-sort-name',
                onClick: () => setSort('name'),
              },
              {
                label: 'evm_nft_sort_token_id',
                selected: sort === 'tokenId',
                testId: 'nft-sort-token-id',
                onClick: () => setSort('tokenId'),
              },
              {
                label: 'evm_nft_sort_quantity',
                selected: sort === 'quantity',
                testId: 'nft-sort-quantity',
                onClick: () => setSort('quantity'),
              },
            ]}
          />
        </div>
        <div className="nft-list" ref={backToTopHook.list}>
          {visibleItems.map((listItem) => {
            const quantity = EvmNftDisplayUtils.getNftOwnedQuantity(
              listItem.item,
            );
            const displayName = EvmNftDisplayUtils.getNftDisplayName(
              listItem.item,
              listItem.collection.tokenInfo.name,
            );
            return (
              <div
                className="nft-gallery-tile"
                key={`${listItem.collection.tokenInfo.contractAddress}-${listItem.item.id}`}>
                <button
                  type="button"
                  className="nft-gallery-open"
                  onClick={() => onSelectNft(listItem)}>
                  <div className="nft-gallery-art">
                    <EvmNftMedia src={listItem.item.metadata.image} />
                    {quantity > 1 && (
                      <span className="nft-balance">{`×${quantity}`}</span>
                    )}
                  </div>
                  <div className="nft-gallery-tile-name">{displayName}</div>
                  <div className="nft-gallery-tile-meta">{`#${listItem.item.id}`}</div>
                </button>
                <EvmNftOptionsMenu
                  additionalClass="nft-gallery-tile-menu"
                  triggerLabel="dialog_options"
                  icon={SVGIcons.GLOBAL_MENU_DOTS}
                  testId={`nft-item-menu-${listItem.item.id}`}
                  items={[
                    {
                      label: 'evm_nft_copy_token_id',
                      testId: `nft-copy-token-id-${listItem.item.id}`,
                      onClick: () => {
                        void copyTextWithToast(
                          listItem.item.id,
                          COPY_GENERIC_MESSAGE_KEY,
                        );
                      },
                    },
                  ]}
                />
              </div>
            );
          })}
          {backToTopHook.displayScrollToTop && (
            <BackToTopButton element={backToTopHook.list} />
          )}
        </div>
      </FormContainer>
    </div>
  );
};
