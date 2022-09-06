import { NftApis } from '@api/nft.api';
import {
  NFTFilter,
  NFTItem,
  OtherFilters,
  SplinterlandItem,
} from '@interfaces/ntf.interface';

const getCategories = () => {
  return [
    {
      name: 'Splinterlands',
      image: 'https://images.hive.blog/u/steemmonsters/avatar',
      getAllMine: getAllSplinterlandsCardOfUser,
      filter: filterSplinterlandsCards,
    },
  ];
};

const filterSplinterlandsCards = (allCards: NFTItem[], filters: NFTFilter) => {
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
        )
          continue;
        for (const key in filters.otherFilters[filterCategory]) {
          if (!filters.otherFilters[filterCategory][key].selected) continue;
          if (
            filters.otherFilters[filterCategory][key].selected &&
            card[filterCategory as keyof SplinterlandItem] ===
              filters.otherFilters[filterCategory][key].referenceValue
          ) {
            return true;
          }
        }
      }
    }
    return false;
  });
};

const hasNoFilterSelected = (otherFilters: OtherFilters) => {
  for (const filter in otherFilters) {
    if (
      Object.values(otherFilters[filter]).some(
        (value) => value.selected === true,
      )
    ) {
      return false;
    }
  }
  return true;
};

const getAllSplinterlandsCardOfUser = async (username: string) => {
  const collection = (
    await NftApis.SplinterlandsApi.get('/cards/collection/kiokizz')
  ).data;
  const allCardsId = collection.cards.map((card: any) => card.uid);
  const cardsDetail = (
    await NftApis.SplinterlandsApi.get(
      `/cards/find?ids=${allCardsId.join(',')}`,
    )
  ).data;

  const allCards: SplinterlandItem[] = [];
  for (const card of cardsDetail) {
    const cardFromCollection = collection.cards.find(
      (c: any) => c.uid === card.uid,
    );
    console.log(card, cardFromCollection);
    const alreadyExisting = allCards.find(
      (c: SplinterlandItem) =>
        c.cardDetailId === cardFromCollection.card_detail_id &&
        c.gold === cardFromCollection.gold,
    );
    if (alreadyExisting) {
      alreadyExisting.count++;
    } else {
      const editionString = EDITION[card.edition];
      const isGold = cardFromCollection.gold;
      allCards.push({
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
      } as SplinterlandItem);
    }
  }
  allCards.sort((a, b) => a.name.localeCompare(b.name));
  return allCards;
};
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

export const NftsUtils = {
  getCategories,
  hasNoFilterSelected,
};
