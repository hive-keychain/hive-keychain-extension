export interface UserPortfolio {
  account: string;
  balances: PortfolioBalance[];
  totalHive: number;
  totalUSD: number;
}

export interface PortfolioBalance {
  symbol: string;
  balance: number;
  usdValue: number;
}
