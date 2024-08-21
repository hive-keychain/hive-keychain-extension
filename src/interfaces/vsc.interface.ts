export enum VscStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  INCLUDED = 'INCLUDED',
}

export enum VscHistoryType {
  CONTRACT_CALL = 'CONTRACT_CALL',
  TRANSFER = 'TRANSFER',
}

export enum VscLedgerType {
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
}

export enum VscToken {
  HIVE = 'HIVE',
  HBD = 'HBD',
}

export type VscHistoryResponse = {
  findLedgerTXs: {
    txs: VscTransfer[];
  };
  findTransaction: {
    txs: VscCall[];
  };
};

export type VscTransfer = {
  type?: VscHistoryType.TRANSFER;
  amount: number;
  block_height: number;
  from: string;
  id: string;
  memo: string | null;
  owner: string;
  t: VscLedgerType;
  tk: VscToken;
  status: VscStatus;
};

export type VscCall = {
  type?: VscHistoryType.CONTRACT_CALL;
  status: VscStatus;
  id: string;
  anchored_height: number;
  first_seen: string;
  data: {
    action: string;
    contract_id: string;
    op: string;
    payload: object;
  };
  required_auths: { value: string }[];
};
