export interface NFTItem {
  id: string;
  name: string;
  image: string;
  count: number;
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
  getAllMine: (username: string) => NFTItem[];
  filter: (allItems: NFTItem[], filter: NFTFilter) => NFTItem[];
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
