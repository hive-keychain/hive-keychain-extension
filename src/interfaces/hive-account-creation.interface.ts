import type { AuthorityType } from '@hiveio/dhive';

export type HiveAccountCreationStatus =
  | 'payment_pending'
  | 'payment_detected'
  | 'payment_confirming'
  | 'creating_account'
  | 'account_created'
  | 'expired'
  | 'underpaid'
  | 'overpaid'
  | 'paid_after_expiry'
  | 'username_unavailable'
  | 'account_creation_failed'
  | 'cancelled';

export interface HiveAccountCreationAuthorities {
  owner: AuthorityType;
  active: AuthorityType;
  posting: AuthorityType;
  memo_key: string;
}

export interface CreateHiveAccountCreationQuoteRequest {
  username: string;
  authorities: HiveAccountCreationAuthorities;
}

export interface HiveAccountCreationPayment {
  account: string;
  amount: string;
  asset: 'HIVE' | 'HBD';
  memo: string;
}

export interface HiveAccountCreationQuoteResponse {
  requestId: string;
  username: string;
  status: HiveAccountCreationStatus;
  fee: string;
  payment: HiveAccountCreationPayment;
  expiresAt: string;
}

export interface HiveAccountCreationStatusResponse {
  requestId: string;
  username: string;
  status: HiveAccountCreationStatus;
  fee?: string;
  paidAmount?: string;
  txId?: string;
  createdAccount?: string;
  expiresAt?: string;
  updatedAt?: string;
  error?: string;
}
