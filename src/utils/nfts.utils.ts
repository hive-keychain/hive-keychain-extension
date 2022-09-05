import { NftApis } from '@api/nft.api';
import { SplinterlandItem } from '@interfaces/ntf.interface';

const getCategories = () => {
  return [
    {
      name: 'Splinterlands',
      image: 'https://images.hive.blog/u/steemmonsters/avatar',
      getAllMine: getAllSplinterlandsCardOfUser,
    },
  ];
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
    const alreadyExisting = allCards.find(
      (c: SplinterlandItem) =>
        c.cardDetailId === cardFromCollection.card_detail_id,
    );
    if (alreadyExisting) {
      alreadyExisting.count++;
    } else {
      const rarity = RARITY[card.details.rarity];
      const name = card.details.name;
      const edition = EDITION[card.edition];
      const level = cardFromCollection.level;
      const isGold = cardFromCollection.gold;
      if (!edition) {
        console.log(edition, card.edition, name);
      }
      allCards.push({
        id: card.uid,
        cardDetailId: cardFromCollection.card_detail_id,
        count: 1,
        name: name,
        level: level,
        rarity: rarity,
        edition: edition,
        gold: isGold,
        image: `https://d36mxiodymuqjm.cloudfront.net/cards_by_level/${edition.toLowerCase()}/${name}_lv${level}${
          isGold ? '_gold' : ''
        }.png`,
      } as SplinterlandItem);
    }
  }
  allCards.sort((a, b) => a.name.localeCompare(b.name));
  console.log(allCards);
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

export const NftsUtils = {
  getCategories,
};
