export enum DelegationCurrency {
  HIVE = 'HIVE',
  HBD = 'HBD',
}

export interface DelegationRequest {
  value: number; // Value of the delegation
  days: number; // How many days is the delegation for
  payAmount: number; // How much is the delegatee willing to pay
  payCurrency: DelegationCurrency;
}
