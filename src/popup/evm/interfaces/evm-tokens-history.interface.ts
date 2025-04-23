import { CanceledTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';

export interface EvmUsersHistory {
  [walletAddress: string]: EvmUserHistory;
}
export interface EvmUserHistory {
  events: EvmUserHistoryItem[];
  lastPage: number;
  fullyFetch: boolean;
}

export interface EvmLocalHistory {
  [chain: string]: EvmUsersHistory;
}

export interface EvmUserHistoryItem {
  type: EvmUserHistoryItemType;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  timestamp: number;
  label: string;
  nonce: number;
  details?: string;
  cancelDetails?: CanceledTransactionData;
  isCanceled?: boolean;
}

export interface EvmTokenTransferInHistoryItem extends EvmUserHistoryItem {
  type: EvmUserHistoryItemType.TRANSFER_IN;
  from: string;
  to: string;
  amount: string;
}
export interface EvmTokenTransferOutHistoryItem extends EvmUserHistoryItem {
  type: EvmUserHistoryItemType.TRANSFER_OUT;
  from: string;
  to: string;
  amount: string;
}

export enum EvmUserHistoryItemType {
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  SMART_CONTRACT_CREATION = 'SMART_CONTRACT_CREATION',
  SMART_CONTRACT = 'SMART_CONTRACT',
}
