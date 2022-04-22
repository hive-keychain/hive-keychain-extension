export type DelegationCurrency = 'hive' | 'hbd';

export enum DelegationRequestStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELED = 'canceled',
}

export interface DelegationRequest {
  id: string;
  creator: string;
  creationDate: Date | string;
  delegator?: string;
  activatedDate?: Date | string;
  dailyPay: number;
  dailyFee: number;
  currency: DelegationCurrency;
  value: number; // Value of the delegation
  totalAmount: number;
  duration: number; // days
  status: string;
  cancelationDate?: Date | string;
}
