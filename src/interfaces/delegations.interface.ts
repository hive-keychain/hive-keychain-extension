import { VestingDelegation } from '@hiveio/dhive';

export interface Delegations {
  incoming: IncomingDelegation[];
  outgoing: VestingDelegation[];
}

export interface IncomingDelegation {
  delegation_date: string;
  delegator: string;
  vesting_shares: number;
}

export interface DelegationsPayload {
  incoming?: IncomingDelegation[];
  outgoing?: VestingDelegation[];
}

export interface Delegator {
  delegator: string;
  vesting_shares: number;
  delegation_date: string;
}
