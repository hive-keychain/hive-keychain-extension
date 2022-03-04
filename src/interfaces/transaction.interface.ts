import { OperationName, VirtualOperationName } from '@hiveio/dhive';

export interface Transactions {
  loading: boolean;
  list: Transaction[];
}
export interface Transaction {
  blockNumber: number;
  txId: string;
  index: number;
  key: string;
  type: OperationName | VirtualOperationName;
  timestamp: string;
  lastFetched?: boolean;
  last?: boolean;
  url: string;
}
export interface Transfer extends Transaction {
  amount: string;
  from: string;
  memo: string;
  to: string;
}

export interface RecurrentTransfer extends Transfer {
  executions: number;
  recurrence: number;
}

export interface FillRecurrentTransfer extends Transfer {
  remainingExecutions: number;
}

export interface Delegation extends Transaction {
  amount: string;
  delegator: string;
  delegatee: string;
}

export interface ClaimReward extends Transaction {
  hp: string;
  hbd: string;
  hive: string;
}
