export interface BalanceDetails {
  symbol: string;
  before: string;
  rawBefore?: string;
  estimatedAfter: string;
  insufficientBalance?: boolean;
}

export interface BalanceInfo {
  mainBalance: BalanceDetails;
  feeBalance?: BalanceDetails;
  balances?: BalanceDetails[];
}
