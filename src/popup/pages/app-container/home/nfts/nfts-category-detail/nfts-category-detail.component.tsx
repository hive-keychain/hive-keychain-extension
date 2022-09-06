import { NFTCategory, NFTFilter, NFTItem } from '@interfaces/ntf.interface';
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

const splinterlandsFilters = [
  {
    name: 'html_popup_nfts_filter_sl_category_edition',
    key: 'edition',
    items: [
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-alpha.svg',
        key: 'alpha',
        value: 0,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-beta.svg',
        key: 'beta',
        value: 1,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-promo.svg',
        key: 'promo',
        value: 2,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-reward.svg',
        key: 'reward',
        value: 3,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-untamed.svg',
        key: 'untamed',
        value: 4,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-dice.svg',
        key: 'dice',
        value: 5,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-gladius.svg',
        key: 'gladius',
        value: 6,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-chaos.svg',
        key: 'chaos',
        value: 7,
      },
    ],
    areItemsImages: true,
  },
  {
    name: 'html_popup_nfts_filter_sl_category_foil',
    key: 'gold',
    items: [
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon_foil_standard.svg',
        key: 'standard',
        value: false,
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon_foil_gold.svg',
        key: 'gold',
        value: true,
      },
    ],
    areItemsImages: true,
  },
  {
    name: 'html_popup_nfts_filter_sl_category_role',
    key: 'type',
    items: [
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-monster.svg',
        key: 'monster',
        value: 'monster',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-summoner.svg',
        key: 'summoner',
        value: 'summoner',
      },
    ],
    areItemsImages: true,
  },
  {
    name: 'html_popup_nfts_filter_sl_category_rarity',
    key: 'rarity',
    items: [
      {
        url: '/assets/images/splinterlands/splinterlands-rarity-common.svg',
        key: 'common',
        value: 1,
      },
      {
        url: '/assets/images/splinterlands/splinterlands-rarity-rare.svg',
        key: 'rare',
        value: 2,
      },
      {
        url: '/assets/images/splinterlands/splinterlands-rarity-epic.svg',
        key: 'epic',
        value: 3,
      },
      {
        url: '/assets/images/splinterlands/splinterlands-rarity-legendary.svg',
        key: 'legendary',
        value: 4,
      },
    ],
    areItemsImages: true,
  },
  {
    name: 'html_popup_nfts_filter_sl_category_element',
    key: 'element',
    items: [
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-fire-2.svg',
        key: 'fire',
        value: 'fire',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-water-2.svg',
        key: 'water',
        value: 'water',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-earth-2.svg',
        key: 'earth',
        value: 'earth',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-life-2.svg',
        key: 'life',
        value: 'life',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-death-2.svg',
        key: 'death',
        value: 'death',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-dragon-2.svg',
        key: 'dragon',
        value: 'dragon',
      },
      {
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-neutral-2.svg',
        key: 'neutral',
        value: 'neutral',
      },
    ],
    areItemsImages: true,
  },
];

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
    setDisplayedNfts(newDisplayedValues);
  }, [filter]);

  const init = async () => {
    setAllMine(await category.getAllMine(activeAccountName));
    initFilter();
  };

  const initFilter = () => {
    const newFilter: NFTFilter = {
      filterValue: '',
      otherFilters: {},
    };
    for (const filterCategory of splinterlandsFilters) {
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
            {splinterlandsFilters.map((filterCategory) => (
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
            ))}
          </div>
        </div>
      </div>
      <div className="main-panel" ref={list}>
        {displayedNfts.map((item, index) => (
          <NftCardComponent item={item} key={item.image + '-' + index} />
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
