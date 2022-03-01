import { OperationName, VirtualOperationName } from '@hiveio/dhive';

export interface Transfer {
  key: string;
  amount: string;
  from: string;
  memo: string;
  timestamp: string;
  to: string;
  type: OperationName | VirtualOperationName;
  last?: boolean;
  index?: number;
  txId?: string;
}

export interface Transactions {
  loading: boolean;
  list: Transaction[];
}

export type Transaction = Transfer;
