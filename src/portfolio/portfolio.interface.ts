export interface UserPortfolio {
  account: string;
  balances: PortfolioBalance[];
  totalHive: number;
  totalUSD: number;
}

export interface PortfolioHiveEngineBalanceBreakdown {
  liquid: number;
  stake: number;
  delegationsIn: number;
  delegationsOut: number;
  pendingUnstake: number;
  pendingUndelegations: number;
}

export interface PortfolioBalance {
  symbol: string;
  balance: number;
  usdValue: number;
  priceUsd?: number | null;
  breakdown?: PortfolioHiveEngineBalanceBreakdown;
}
