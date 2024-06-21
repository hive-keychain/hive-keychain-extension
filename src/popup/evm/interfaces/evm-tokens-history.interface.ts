export interface EvmTokenHistory {
  events: EvmTokenHistoryItem[];
  lastBlock: number;
}

export interface EvmTokenHistoryItem {
  type: EvmTokenHistoryItemType;
  address: string;
  blockNumber: number;
  index: number;
  transactionHash: string;
  transactionIndex: number;
  timestamp: Date;
}

export interface EvmTokenTransferInHistoryItem extends EvmTokenHistoryItem {
  type: EvmTokenHistoryItemType.TRANSFER_IN;
  from: string;
  to: string;
  amount: string;
}
export interface EvmTokenTransferOutHistoryItem extends EvmTokenHistoryItem {
  type: EvmTokenHistoryItemType.TRANSFER_OUT;
  from: string;
  to: string;
  amount: string;
}

export enum EvmTokenHistoryItemType {
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}
