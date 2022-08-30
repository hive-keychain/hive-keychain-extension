import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { RequestId, RequestProxy } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';

export type PropsRequestBalance = {
  amount: number;
  currency: string;
  username?: string;
  rpc: Rpc;
};

export type PropsRequestItem = {
  title: string;
  content: string;
  pre?: boolean;
  red?: boolean;
};

export type PropsRequestTokenBalance = {
  amount: number;
  currency: string;
  username: string;
  hiveEngineConfig: HiveEngineConfig;
};

export type PropsRequestUsername = {
  accounts: string[];
  username: string;
  setUsername: (username: string) => void;
};

export type PropsRequestProxy = {
  data: RequestProxy & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};
