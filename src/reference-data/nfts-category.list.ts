import { NFTFilterCategoryDefinition } from '@interfaces/ntf.interface';

export const Splinterlands: NFTFilterCategoryDefinition[] = [
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
