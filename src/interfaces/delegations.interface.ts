import type { VestingDelegation } from '@hiveio/dhive';

export interface Delegations {
  incoming: IncomingDelegation[];
  outgoing: VestingDelegation[];
  pendingOutgoingUndelegation: PendingOutgoingUndelegation[];
}

export interface IncomingDelegation {
  delegation_date: string;
  delegator: string;
  vesting_shares: number;
}

export interface DelegationsPayload {
  incoming?: IncomingDelegation[] | null;
  outgoing?: VestingDelegation[];
  pendingOutgoingUndelegation?: PendingOutgoingUndelegation[];
}

export interface Delegator {
  delegator: string;
  vesting_shares: number;
  delegation_date: string;
}

export interface PendingOutgoingUndelegation {
  delegator: string;
  vesting_shares: number;
  expiration_date: string;
}
