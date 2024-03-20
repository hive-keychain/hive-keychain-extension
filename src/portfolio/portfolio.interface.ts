export interface UserPortfolio {
  account: string;
  balances: PortfolioBalance[];
}

export interface PortfolioBalance {
  symbol: string;
  balance: number;
  usdValue: number;
}
