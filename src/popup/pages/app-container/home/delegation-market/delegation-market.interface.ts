export type DelegationCurrency = 'hive' | 'hbd';

export enum DelegationRequestStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export interface DelegationRequest {
  id: string;
  creationDate: Date | string;
  activatedDate?: Date | string;
  creator: string;
  value: number; // Value of the delegation
  days: number; // How many days is the delegation for
  payAmount: number; // How much is the delegatee willing to pay
  payCurrency: DelegationCurrency;
  status: DelegationRequestStatus;
  delegator?: string;
}
