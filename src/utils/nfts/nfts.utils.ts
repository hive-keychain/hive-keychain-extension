import { NFTSymbols, OtherFilters } from '@interfaces/ntf.interface';
import { GlobalNFTsUtils } from 'src/utils/nfts/global.utils';
import { SplinterlandsUtils } from 'src/utils/nfts/splinterlands.utils';

const getCategories = () => {
  return [
    {
      name: 'Splinterlands',
      image: 'https://images.hive.blog/u/steemmonsters/avatar',
      cardBackgroundImage:
        'https://d36mxiodymuqjm.cloudfront.net/website/bg_energy-cloud.jpg',
      getAllMine: SplinterlandsUtils.getAll,
      filter: SplinterlandsUtils.filter,
      filters: SplinterlandsUtils.filterDefinition,
    },
    {
      name: 'Rising Star',
      symbol: NFTSymbols.RISING_STAR,
      image: 'https://images.hive.blog/u/risingstargame/avatar',
      getAllMine: GlobalNFTsUtils.getAll,
      filter: SplinterlandsUtils.filter,
      filters: SplinterlandsUtils.filterDefinition,
    },
    {
      name: 'DCity',
      symbol: NFTSymbols.D_CITY,
      image: 'https://images.hive.blog/u/risingstargame/avatar',
      getAllMine: GlobalNFTsUtils.getAll,
      filter: SplinterlandsUtils.filter,
      filters: SplinterlandsUtils.filterDefinition,
    },
  ];
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

export const NftsUtils = {
  getCategories,
  hasNoFilterSelected,
};
