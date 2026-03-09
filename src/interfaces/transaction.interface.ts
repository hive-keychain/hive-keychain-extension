import type { OperationName, VirtualOperationName } from '@hiveio/dhive';
import { Asset } from 'hive-keychain-commons';

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

export interface PendingRecurrentTransfer {
  amount: Asset;
  consecutive_failures: number;
  from: string;
  id: number;
  memo: string;
  pair_id: number;
  recurrence: number;
  remaining_executions: number;
  to: string;
  trigger_date: string;
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
export interface EscrowTransfer extends Transaction {
  from: string;
  to: string;
  escrow_id: number;
  agent: string;
  hbd_amount: string;
  hive_amount: string;
  fee: string;
  ratification_deadline: string;
  escrow_expiration: string;
  json_meta: string;
}
export interface EscrowApprove extends Transaction {
  from: string;
  to: string;
  escrow_id: number;
  approve: boolean;
  who: string;
  agent: string;
}
export interface EscrowDispute extends Transaction {
  from: string;
  to: string;
  escrow_id: number;
  who: string;
  agent: string;
}
export interface EscrowRelease extends Transaction {
  from: string;
  to: string;
  escrow_id: number;
  who: string;
  receiver: string;
  agent: string;
  hbd_amount: string;
  hive_amount: string;
}
