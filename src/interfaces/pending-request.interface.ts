export type PendingRequestChain = 'hive' | 'evm';

export type PendingRequestSource = {
  tab: number;
  frameId: number;
  documentId?: string;
  origin: string;
};
export type PendingRequestLocator = {
  requestId: number;
  tab: number;
  frameId?: number;
  documentId?: string;
  origin: string;
};
