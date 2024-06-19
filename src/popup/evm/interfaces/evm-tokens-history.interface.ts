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
}

export interface EvmTokenTransferInHistoryItem extends EvmTokenHistoryItem {
  type: EvmTokenHistoryItemType.TRANSFER_IN;
  from: string;
  to: string;
  amount: string;
}

export enum EvmTokenHistoryItemType {
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}
