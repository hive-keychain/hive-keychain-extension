export interface BalanceDetails {
  before: string;
  estimatedAfter: string;
  insufficientBalance?: boolean;
}

export interface BalanceInfo {
  mainBalance: BalanceDetails;
  feeBalance?: BalanceDetails;
}
