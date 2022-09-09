import { NftApis } from '@api/nft.api';
import {
  NFTFilter,
  NFTFilterCategoryDefinition,
  NFTItem,
  SplinterlandItem,
} from '@interfaces/ntf.interface';
import Config from 'src/config';
import ArrayUtils from 'src/utils/array.utils';
import { NftsUtils } from 'src/utils/nfts/nfts.utils';
import { v4 as uuidv4 } from 'uuid';

const getAll = async (username: string) => {
  const collection = (
    await NftApis.SplinterlandsApi.get('/cards/collection/stoodmonsters')
  ).data;
  const allCardsId = collection.cards.map((card: any) => card.uid);

  const allCardsIdArray: string[][] = [[]];
  const findDetailApi = '/cards/find?ids=';
  const baseApiLength = (Config.nft.splinterlands.baseApi + findDetailApi)
    .length;
  let caractersRemaining = 2048 - baseApiLength;

  for (const id of allCardsId) {
    if (caractersRemaining - id.length <= 0) {
      allCardsIdArray.push([]);
      caractersRemaining = 2048 - baseApiLength;
    }
    allCardsIdArray[allCardsIdArray.length - 1].push(id);
    caractersRemaining -= id.length;
  }

  const promises = [];
  for (const array of allCardsIdArray) {
    promises.push(
      new Promise((resolve, reject) => {
        const res = NftApis.SplinterlandsApi.get(
          `${findDetailApi}${array.join(',')}`,
        );
        resolve(res);
      }),
    );
  }

  const result = (await Promise.all(promises)).map(
    (promiseResult: any) => promiseResult.data,
  );

  const cardsDetail = ArrayUtils.mergeArrayofArray(result);

  const allCards: SplinterlandItem[] = [];
  for (const card of cardsDetail) {
    const cardFromCollection = collection.cards.find(
      (c: any) => c.uid === card.uid,
    );
    const alreadyExisting = allCards.find(
      (c: SplinterlandItem) =>
        c.cardDetailId === cardFromCollection.card_detail_id &&
        c.gold === cardFromCollection.gold &&
        c.level === cardFromCollection.level,
    );
    if (card.details.name.toLowerCase() === 'vera salacia') {
      console.log(cardFromCollection);
    }

    const editionString = EDITION[card.edition];
    const isGold = cardFromCollection.gold;

    const item = {
      key: uuidv4(),
      id: card.uid,
      cardDetailId: cardFromCollection.card_detail_id,
      count: 1,
      name: card.details.name,
      level: cardFromCollection.level,
      rarity: card.details.rarity,
      edition: card.edition,
      gold: isGold,
      type: card.details.type.toLowerCase(),
      element: ELEMENT_COLOR_MAPPING_TABLE[card.details.color],
      image: `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${editionString.toLowerCase()}/${
        card.details.name
      }_lv${cardFromCollection.level}${isGold ? '_gold' : ''}.png`,
      duplicates: [],
    } as SplinterlandItem;
    if (alreadyExisting) {
      alreadyExisting.count++;
      alreadyExisting.duplicates.push(item);
    } else {
      allCards.push(item);
    }
  }
  allCards.sort((a, b) => a.name.localeCompare(b.name));
  console.log(allCards);
  return allCards;
};

const filter = (allCards: NFTItem[], filters: NFTFilter) => {
  const allSplinterlandCards = allCards as SplinterlandItem[];

  const noOtherFilters = NftsUtils.hasNoFilterSelected(filters.otherFilters);

  return allSplinterlandCards.filter((card: SplinterlandItem) => {
    const lowerCaseFilterValue = filters.filterValue.toLowerCase();
    if (
      card.name.toLowerCase().includes(lowerCaseFilterValue) ||
      card.id.toLowerCase().includes(lowerCaseFilterValue)
    ) {
      if (noOtherFilters) return true;
      for (const filterCategory in filters.otherFilters) {
        if (
          Object.values(filters.otherFilters[filterCategory]).every(
            (value) => value.selected === false,
          )
        ) {
          continue;
        }
        for (const key in filters.otherFilters[filterCategory]) {
          if (!filters.otherFilters[filterCategory][key].selected) continue;
          if (
            card[filterCategory as keyof SplinterlandItem] !==
            filters.otherFilters[filterCategory][key].referenceValue
          ) {
            return false;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  });
};

const filterDefinition: NFTFilterCategoryDefinition[] = [
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

const EDITION = [
  'Alpha',
  'Beta',
  'Promo',
  'Reward',
  'Untamed',
  'Dice',
  'Gladius',
  'Chaos',
];
const RARITY = ['Common', 'Rare', 'Epic', 'Legendary'];

const ELEMENT_COLOR_MAPPING_TABLE = {
  Red: 'fire',
  Blue: 'water',
  Black: 'death',
  Green: 'earth',
  Gray: 'neutral',
  White: 'life',
  Gold: 'dragon',
} as { [key: string]: string };

export const SplinterlandsUtils = {
  getAll,
  filter,
  filterDefinition,
};
