export interface RcDelegation {
  value: string;
  delegator: string;
  delegatee: string;
}

export interface RCDelegationValue {
  hpValue: string;
  gigaRcValue: string;
}

export interface RcDelegationsInfo {
  delegated_rc: number;
  received_delegated_rc: number;
  max_rc: number;
  rc_manabar: {
    current_mana: string;
    last_update_time: number;
  };
}
