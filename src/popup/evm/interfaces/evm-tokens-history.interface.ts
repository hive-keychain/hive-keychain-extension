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
  pageTitle: string;
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
  receiverAddress?: string;

  detailFields?: EvmUserHistoryItemDetail[];
}

export interface EvmUserHistoryItemDetail {
  label: string;
  value: string;
  type: EvmUserHistoryItemDetailType;
}

export enum EvmUserHistoryItemDetailType {
  BASE = 'BASE',
  IMAGE = 'IMAGE',
  ADDRESS = 'ADDRESS',
  TOKEN_AMOUNT = 'TOKEN_AMOUNT',
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
