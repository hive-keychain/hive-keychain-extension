export interface NFTItem {
  key: string;
  id: string;
  name: string;
  image: string;
  count: number;
  duplicates: SplinterlandItem[];
}

export interface SplinterlandItem extends NFTItem {
  rarity: string;
  level: number;
  edition: string;
  cardDetailId: string;
  gold: boolean;
  type: string;
  element: string;
}

export interface NFTCategory {
  name: string;
  image: string;
  cardBackgroundImage?: string;
  symbol?: NFTSymbols;
  getAllMine: (username: string, symbol?: NFTSymbols) => Promise<unknown[]>;
  filter: (allItems: unknown[], filter: NFTFilter) => unknown[];
  filters: NFTFilterCategoryDefinition[];
}

export interface NFTFilterCategoryDefinition {
  name: string;
  key: string;
  items: NFTFilterItemDefintion[];
  areItemsImages: boolean;
}

export interface NFTFilterItemDefintion {
  url: string;
  key: string;
  value: string | boolean | number;
}

export interface NFTFilter {
  filterValue: string;
  otherFilters: OtherFilters;
}

export interface OtherFilters {
  [key: string]: {
    [key: string]: {
      referenceValue: any;
      selected: boolean;
    };
  };
}

export enum NFTSymbols {
  RISING_STAR = 'STARinstances',
  D_CITY = 'CITYinstances',
}
