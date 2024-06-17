export interface Rpc {
  uri: string;
  testnet: boolean;
  chainId?: string;
}

// Coming from our API backend
export interface RpcStatusResponse {
  updatedAt: number;
  hive: HiveRpcStatus[];
  hiveEngine: RpcStatus[];
  hiveEngineHistory: RpcStatus[];
  costs: RcCosts[];
}

export interface RpcStatus {
  name: string;
  endpoint: string;
  version: string;
  score: number;
  updated_at: string;
  success: number;
  fail: number;
  features: string[];
}

export interface HiveRpcStatus extends RpcStatus {
  lastBlock: number;
}

export interface RcCosts {
  timestamp: string;
  costs: RcCost[];
}

export interface RcCost {
  operation: string;
  rc_needed: number;
  hp_needed: number;
}

export enum RpcStatusType {
  hive = 'hive',
  hiveEngine = 'hiveEngine',
  hiveEngineHistory = 'hiveEngineHistory',
}
