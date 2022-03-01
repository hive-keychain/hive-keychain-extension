import { OperationName, VirtualOperationName } from '@hiveio/dhive';

export interface Transactions {
  loading: boolean;
  list: Transaction[];
}
export interface Transaction {
  txId: string;
  index: number;
  key: string;
  type: OperationName | VirtualOperationName;
  timestamp: string;
  last?: boolean;
}
export interface Transfer extends Transaction {
  amount: string;
  from: string;
  memo: string;
  to: string;
}

export interface ClaimReward extends Transaction {
  hp: string;
  hbd: string;
  hive: string;
}
