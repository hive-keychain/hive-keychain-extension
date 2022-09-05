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
}

export interface NFTCategory {
  name: string;
  image: string;
  getAllMine: (username: string) => NFTItem[];
}
