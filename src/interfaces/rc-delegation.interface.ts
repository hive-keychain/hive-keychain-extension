export interface RcDelegation {
  value: string;
  delegator: string;
  delegatee: string;
}

export interface RCDelegationValue {
  hpValue: string;
  rcValue: string;
}

export interface RcDelegationsInfo {
  delegated_rc: number;
  received_delegated_rc: number;
  max_rc: number;
}
