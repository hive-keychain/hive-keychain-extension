import type { OperationName, VirtualOperationName } from '@hiveio/dhive';

export type CustomTransactionType = 'savings' | 'power_up_down';
export interface Transactions {
  loading: boolean;
  list: Transaction[];
  lastUsedStart: number;
}
export interface Transaction {
  blockNumber: number;
  txId: string;
  index: number;
  key: string;
  type: OperationName | VirtualOperationName | CustomTransactionType;
  subType?: OperationName | VirtualOperationName;
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

export interface PowerUp extends Transaction {
  amount: string;
  to: string;
  from: string;
}

export interface PowerDown extends Transaction {
  amount: string;
}

export interface ReceivedInterests extends Transaction {
  interest: string;
}

export interface DepositSavings extends Transaction {
  amount: string;
  to: string;
  from: string;
}

export interface StartWithdrawSavings extends Transaction {
  amount: any;
}
export interface WithdrawSavings extends Transaction {
  amount: any;
}

export interface ClaimAccount extends Transaction {}

export interface Convert extends Transaction {
  amount: string;
}
export interface CollateralizedConvert extends Transaction {
  amount: string;
}
export interface FillConvert extends Transaction {
  amount_in: string;
  amount_out: string;
}
export interface FillCollateralizedConvert extends Transaction {
  amount_in: string;
  amount_out: string;
}

export interface CreateClaimedAccount extends Transaction {
  creator: string;
  new_account_name: string;
}

export interface CreateAccount extends Transaction {
  creator: string;
  new_account_name: string;
  fee: string;
}

export interface ProducerReward extends Transaction {
  producer: string;
  vesting_shares: string;
}
