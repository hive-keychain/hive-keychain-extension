import { BaseCurrencies } from 'src/utils/currency.utils';

export type LeaseCurrency = 'hive' | 'hbd';

export enum LeaseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELED = 'canceled',
}

export interface Lease {
  id: string;
  creator: string;
  creationDate: Date | string;
  delegator?: string;
  activatedDate?: Date | string;
  dailyPay: number;
  dailyFee: number;
  currency: LeaseCurrency;
  value: number; // Value of the delegation
  totalAmount: number;
  duration: number; // days
  status: string;
  cancelationDate?: Date | string;
}

export interface LeaseRequest {
  id: string;
  weeklyPay: number;
  weeklyPayCurrency: BaseCurrencies;
  duration: number;
  delegationValue: number;
}