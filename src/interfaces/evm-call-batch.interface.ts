export interface EvmCallCapability {
  optional?: boolean;
  [key: string]: unknown;
}

export interface EvmCall {
  to?: string;
  data?: string;
  value?: string;
  capabilities?: Record<string, EvmCallCapability>;
}

export interface EvmSendCallsParams {
  version: '2.0.0';
  id?: string;
  from?: string;
  chainId: string;
  atomicRequired: boolean;
  calls: EvmCall[];
  capabilities?: Record<string, EvmCallCapability>;
}

export interface EvmCallFees {
  gasLimit: string;
  type: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface EvmPreparedCall extends EvmCall, EvmCallFees {}

export interface EvmCallBatchPreview {
  from: string;
  chainId: string;
  symbol: string;
  chainName: string;
  calls: EvmPreparedCall[];
  maxFee: string;
  value: string;
  balance: string;
}

export interface EvmCallReceipt {
  logs: { address: string; data: string; topics: string[] }[];
  status: string;
  blockHash: string;
  blockNumber: string;
  gasUsed: string;
  transactionHash: string;
}

export interface EvmCallsStatus {
  version: '2.0.0';
  id: string;
  chainId: string;
  atomic: false;
  status: number;
  receipts: EvmCallReceipt[];
}

export interface EvmSubmissionTransaction {
  hash: string;
  raw?: string;
  broadcast: boolean;
  nonceConsumed?: boolean;
  failed?: boolean;
  receipt?: EvmCallReceipt;
}

export interface EvmTransactionSubmission {
  token: string;
  from: string;
  chainId: string;
  nonce: number;
  count: number;
  createdAt: number;
  expiresAt: number;
  batch?: { id: string; origin: string };
  transactions?: EvmSubmissionTransaction[];
}
