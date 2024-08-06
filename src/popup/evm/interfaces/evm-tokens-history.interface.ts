export interface EvmTokenHistory {
  events: EvmTokenHistoryItem[];
  firstBlock: number; // oldest block
  lastBlock: number; // newest block
}

export interface EvmTokenHistoryItem {
  type: EvmTokenHistoryItemType;
  address: string;
  blockNumber: number;
  index: number;
  transactionHash: string;
  transactionIndex: number;
  timestamp: Date;
  label: string;
  details?: string;
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

export interface EvmUserHistory {
  [chain: string]: {
    [token: string]: EvmTokenHistory;
  };
}

export interface EvmLocalHistory {
  [address: string]: EvmUserHistory;
}
