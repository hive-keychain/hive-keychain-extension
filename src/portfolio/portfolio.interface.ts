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
  /** HIVE/HBD that can be swapped: liquid plus open orders, without savings. */
  spendableBalance?: number;
  breakdown?: PortfolioHiveEngineBalanceBreakdown;
}
