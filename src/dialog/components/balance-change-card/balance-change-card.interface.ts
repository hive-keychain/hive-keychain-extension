export interface BalanceDetails {
  symbol: string;
  before: string;
  estimatedAfter: string;
  insufficientBalance?: boolean;
}

export interface BalanceInfo {
  mainBalance: BalanceDetails;
  feeBalance?: BalanceDetails;
}
