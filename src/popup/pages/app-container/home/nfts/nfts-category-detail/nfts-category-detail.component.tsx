import { NFTCategory, NFTItem } from '@interfaces/ntf.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { NftCardComponent } from '@popup/pages/app-container/home/nfts/nfts-category-detail/nft-card/nft-card.component';
import { RootState } from '@popup/store';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './nfts-category-detail.component.scss';

const DEFAULT_FILTER: Filter = {
  filterValue: '',
  otherFilters: {},
};

interface Filter {
  filterValue: string;
  otherFilters: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
}

const splinterlandsFilters = [
  {
    name: 'html_popup_nfts_filter_category_edition',
    key: 'edition',
    items: [
      {
        name: 'alpha',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-alpha.svg',
        key: 'alpha',
        value: 0,
      },
      {
        name: 'beta',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-beta.svg',
        key: 'beta',
        value: 1,
      },
      {
        name: 'promo',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-promo.svg',
        key: 'promo',
        value: 2,
      },
      {
        name: 'reward',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-reward.svg',
        key: 'reward',
        value: 3,
      },
      {
        name: 'untamed',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-untamed.svg',
        key: 'untamed',
        value: 4,
      },
      {
        name: 'dice',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-dice.svg',
        key: 'dice',
        value: 5,
      },
      {
        name: 'gladius',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-gladius.svg',
        key: 'gladius',
        value: 6,
      },
      {
        name: 'chaos',
        url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-edition-chaos.svg',
        key: 'chaos',
        value: 7,
      },
    ],
    areItemsImages: true,
  },
  // {
  //   name: 'html_popup_nfts_filter_category_foil',
  //   items: [
  //     {
  //       name: 'standard',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon_foil_standard.svg',
  //     },
  //     {
  //       name: 'gold',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon_foil_gold.svg',
  //     },
  //   ],
  //   areItemsImages: true,
  // },
  // {
  //   name: 'html_popup_nfts_filter_category_role',
  //   items: [
  //     {
  //       name: 'monster',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-monster.svg',
  //     },
  //     {
  //       name: 'summoner',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-type-summoner.svg',
  //     },
  //   ],
  //   areItemsImages: true,
  // },
  // {
  //   name: 'html_popup_nfts_filter_category_rarity',
  //   items: [
  //     {
  //       name: 'common',
  //       url: '/assets/images/splinterlands/splinterlands-rarity-common.svg',
  //     },
  //     {
  //       name: 'rare',
  //       url: '/assets/images/splinterlands/splinterlands-rarity-rare.svg',
  //     },
  //     {
  //       name: 'epic',
  //       url: '/assets/images/splinterlands/splinterlands-rarity-epic.svg',
  //     },
  //     {
  //       name: 'legendary',
  //       url: '/assets/images/splinterlands/splinterlands-rarity-legendary.svg',
  //     },
  //   ],
  //   areItemsImages: true,
  // },
  // {
  //   name: 'html_popup_nfts_filter_category_element',
  //   items: [
  //     {
  //       name: 'fire',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-fire-2.svg',
  //     },
  //     {
  //       name: 'water',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-water-2.svg',
  //     },
  //     {
  //       name: 'earth',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-earth-2.svg',
  //     },
  //     {
  //       name: 'life',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-life-2.svg',
  //     },
  //     {
  //       name: 'death',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-death-2.svg',
  //     },
  //     {
  //       name: 'dragon',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-dragon-2.svg',
  //     },
  //     {
  //       name: 'neutral',
  //       url: 'https://d36mxiodymuqjm.cloudfront.net/website/icons/icon-element-neutral-2.svg',
  //     },
  //   ],
  //   areItemsImages: true,
  // },
];

const NftsDetail = ({
  category,
  activeAccountName,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [allMine, setAllMine] = useState<NFTItem[]>([]);
  const [isFilterOpened, setIsFilterPanelOpened] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>(DEFAULT_FILTER);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_nfts_category_market',
      titleParams: [category.name],
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  useEffect(() => {
    // allMine.filter();
  }, [filter]);

  const init = async () => {
    setAllMine(await category.getAllMine(activeAccountName));
    initFilter();
  };

  const initFilter = () => {
    const newFilter: Filter = {
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
          newFilter.otherFilters[filterCategory.key][filterItem.key] = true;
        }
      }
    }
    console.log(newFilter);
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
    newFilter.otherFilters[category][key] =
      !newFilter.otherFilters[category][key];
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
    return filter.otherFilters[category] && filter.otherFilters[category][key];
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
                  {/* {chrome.i18n.getMessage(filterCategory.name)} */}
                  {filterCategory.name}
                </div>
                <div className="category-options">
                  {filterCategory.items.map((categoryItem, index) => (
                    <>
                      {!filterCategory.areItemsImages && (
                        <div
                          className="filter-option-button"
                          key={`options-other-${categoryItem.name}-${index}`}>
                          {chrome.i18n.getMessage(categoryItem.name)}
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
                            key={`options-other-${categoryItem.name}-${index}`}
                            onClick={() =>
                              toggleOtherFilters(
                                filterCategory.key,
                                categoryItem.key,
                              )
                            }
                          />
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="main-panel" ref={list}>
        {allMine.map((item, index) => (
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
