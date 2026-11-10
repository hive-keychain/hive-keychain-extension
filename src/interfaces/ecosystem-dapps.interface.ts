export interface DApp {
  id: number;
  name: string;
  description: string;
  icon: string;
  chainId?: string;
  chainLogo?: string;
  url: string;
  appendUsername?: boolean;
  categories: string[];
  order: number;
}

export interface DAppCategory {
  category: string;
  dapps: DApp[];
}
