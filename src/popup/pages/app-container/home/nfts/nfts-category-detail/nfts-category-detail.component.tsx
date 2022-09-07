import {
  NFTCategory,
  NFTFilter,
  NFTFilterCategoryDefinition,
  NFTItem,
} from '@interfaces/ntf.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { NftCardComponent } from '@popup/pages/app-container/home/nfts/nfts-category-detail/nft-card/nft-card.component';
import { RootState } from '@popup/store';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './nfts-category-detail.component.scss';

const DEFAULT_FILTER: NFTFilter = {
  filterValue: '',
  otherFilters: {},
};

const NftsDetail = ({
  category,
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [allMine, setAllMine] = useState<NFTItem[]>([]);
  const [displayedNfts, setDisplayedNfts] = useState<NFTItem[]>([]);
  const [isFilterOpened, setIsFilterPanelOpened] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<NFTFilter>(DEFAULT_FILTER);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_nfts_category_market',
      titleParams: [category.name],
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  useEffect(() => {
    const newDisplayedValues = category.filter(allMine, filter);
    setDisplayedNfts(newDisplayedValues as NFTItem[]);
  }, [filter]);

  const init = async () => {
    setAllMine((await category.getAllMine(activeAccountName)) as NFTItem[]);
    initFilter();
  };

  const initFilter = () => {
    const newFilter: NFTFilter = {
      filterValue: '',
      otherFilters: {},
    };
    for (const filterCategory of category.filters) {
      if (!newFilter.otherFilters[filterCategory.key]) {
        newFilter.otherFilters[filterCategory.key] = {};
      }
      for (const filterItem of filterCategory.items) {
        if (
          newFilter.otherFilters[filterCategory.key][filterItem.key] ===
          undefined
        ) {
          newFilter.otherFilters[filterCategory.key][filterItem.key] = {
            referenceValue: filterItem.value,
            selected: false,
          };
        }
      }
    }
    setFilter(newFilter);
  };

  const toggleFilter = () => {
    setIsFilterPanelOpened(!isFilterOpened);
  };

  const clearFilters = () => {
    setFilter(DEFAULT_FILTER);
    setTimeout(() => {
      list?.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 200);
  };

  const updateFilterValue = (value: string) => {
    const newFilter = {
      ...filter,
      filterValue: value,
    };
    updateFilter(newFilter);
  };

  const toggleOtherFilters = (category: string, key: string) => {
    const newFilter = {
      ...filter,
    };

    const itemValue = newFilter.otherFilters[category][key];

    newFilter.otherFilters[category][key] = {
      ...itemValue,
      selected: !itemValue.selected,
    };
    updateFilter(newFilter);
  };

  const updateFilter = (filter: any) => {
    setFilter(filter);
    setTimeout(() => {
      list?.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 200);
  };

  const isSelected = (category: string, key: string) => {
    return (
      filter.otherFilters[category] &&
      filter.otherFilters[category][key].selected
    );
  };

  return (
    <div className="nfts-detail-page">
      <div className="description">
        {chrome.i18n.getMessage('popup_html_nfts_detail_description')}
      </div>
      <div
        aria-label="nft-filter-panel"
        className={
          'filter-panel ' + (isFilterOpened ? 'filter-opened' : 'filter-closed')
        }>
        <div className="title-panel" onClick={() => toggleFilter()}>
          <div className="title">Filter</div>
          <img className={'icon'} src="/assets/images/downarrow.png" />
        </div>
        <div className="filters">
          <div className="search-panel">
            <InputComponent
              ariaLabel="input-filter-box"
              type={InputType.TEXT}
              placeholder="popup_html_search"
              value={filter.filterValue}
              onChange={updateFilterValue}
            />
            <div
              aria-label="clear-filters"
              className={'filter-button'}
              onClick={() => clearFilters()}>
              {chrome.i18n.getMessage(`popup_html_clear_filters`)}
            </div>
          </div>
          <div className="filter-selectors">
            {category.filters.map(
              (filterCategory: NFTFilterCategoryDefinition) => (
                <div className={`filter-category`} key={filterCategory.name}>
                  <div className="category-name">
                    {chrome.i18n.getMessage(filterCategory.name)}
                  </div>
                  <div className="category-options">
                    {filterCategory.items.map((categoryItem, index) => (
                      <div key={`item-${categoryItem.key}${index}`}>
                        {!filterCategory.areItemsImages && (
                          <div
                            className="filter-option-button"
                            key={`options-other-${categoryItem.key}-${index}`}>
                            {chrome.i18n.getMessage(categoryItem.key)}
                          </div>
                        )}
                        {filterCategory.areItemsImages && (
                          <div
                            className={`filter-option-image ${
                              isSelected(filterCategory.key, categoryItem.key)
                                ? 'selected'
                                : ''
                            }`}>
                            <img
                              src={categoryItem.url}
                              key={`options-other-${categoryItem.key}-${index}`}
                              onClick={() =>
                                toggleOtherFilters(
                                  filterCategory.key,
                                  categoryItem.key,
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="main-panel" ref={list}>
        {displayedNfts.map((item, index) => (
          <NftCardComponent
            item={item}
            key={item.image + '-' + index}
            backgroundCardImage={category.cardBackgroundImage}
          />
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    category: state.navigation.params?.category as NFTCategory,
    activeAccountName: state.activeAccount.name!,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NftsDetailComponent = connector(NftsDetail);
