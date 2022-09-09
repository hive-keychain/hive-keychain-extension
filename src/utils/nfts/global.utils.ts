import KeychainApi from '@api/keychain';
import { NFTItem, NFTSymbols } from '@interfaces/ntf.interface';
import { v4 as uuidv4 } from 'uuid';

const getAll = async (username: string, symbol: NFTSymbols) => {
  if (symbol === NFTSymbols.RISING_STAR) {
    username = 'tshiuan89';
  } else if (symbol === NFTSymbols.D_CITY) {
    username = 'jellycz';
  }
  const result = (
    await KeychainApi.get(`/hive/nfts/${symbol}/getAll/${username}`)
  ).data;
  console.log(result);
  // const parsedResult = JSON.parse(result.data);
  let items = [];
  for (let card of result) {
    items.push({
      key: uuidv4(),
      name: card.properties.type,
      image: `https://images.nftm.art/${getNftImageCategory(symbol)}/${
        card.properties.type
      }`,
    } as NFTItem);
  }
  return items;
};

const getNftImageCategory = (symbol: NFTSymbols) => {
  switch (symbol) {
    case NFTSymbols.RISING_STAR:
      return 'STAR';
  }
};

export const GlobalNFTsUtils = {
  getAll,
  getNftImageCategory,
};
