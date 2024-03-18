//TODO bellow remove comments when finished.

export interface PortfolioHETokenData {
  symbol: string;
  totalBalance: number; //  liquid + staked+ pendingUnstake + pendingUndelegate
  totalBalanceUsdValue: number;
}

export interface PortfolioUserData {
  account: string;
  HIVE: number; // liquid + savings
  HP: number; // (outgoing + incoming)
  HBD: number; // liquid + savings
  heTokenList: PortfolioHETokenData[];
}
