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
  paymentCurrency?: HiveAccountCreationPaymentCurrency;
  paymentChainId?: string | number;
  paymentTokenAddress?: string | null;
  paymentTokenDecimals?: number;
  payerEvmAddress?: string;
}

export type HiveAccountCreationPaymentCurrency = 'HIVE';

export interface HiveAccountCreationPayment {
  account: string;
  amount: string;
  asset: string;
  memo?: string | null;
  chainId?: string | null;
  tokenAddress?: string | null;
  priceUsd?: string | null;
  payerEvmAddress?: string | null;
}

export interface HiveAccountCreationPaymentSelection {
  paymentCurrency?: HiveAccountCreationPaymentCurrency;
  paymentChainId?: string | number;
  paymentTokenAddress?: string | null;
  payerEvmAddress?: string;
  paymentTokenSymbol?: string;
  paymentTokenName?: string;
  paymentTokenDecimals?: number;
  paymentTokenLogo?: string;
}

export interface HiveAccountCreationQuoteResponse {
  requestId: string;
  username: string;
  status: HiveAccountCreationStatus;
  fee?: string;
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
  payment?: {
    txId?: string | null;
  };
  createdAccount?: string;
  expiresAt?: string;
  updatedAt?: string;
  error?: string;
}

export interface PendingHiveAccountCreationRequest {
  requestId: string;
  username: string;
  encryptedAccount: string;
  paymentCurrency: string;
  paymentAddress: string;
  memo?: string | null;
  amount: string;
  paymentChainId?: string | null;
  paymentTokenAddress?: string | null;
  paymentPriceUsd?: string | null;
  payerEvmAddress?: string | null;
  paymentTokenSymbol?: string;
  paymentTokenName?: string;
  paymentTokenDecimals?: number;
  paymentTokenLogo?: string;
  paymentTxHash?: string | null;
  expiresAt: string;
  status: HiveAccountCreationStatus;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
}

export type SavePendingHiveAccountCreationRequest = Omit<
  PendingHiveAccountCreationRequest,
  'createdAt' | 'updatedAt'
> &
  Partial<Pick<PendingHiveAccountCreationRequest, 'createdAt' | 'updatedAt'>>;

export interface SubmitHiveAccountCreationPaymentTxRequest {
  txHash: string;
  from?: string;
}
