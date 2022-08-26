import { Rpc } from '@interfaces/rpc.interface';

export type PropsRequestBalance = {
  amount: number;
  currency: string;
  username?: string;
  rpc: Rpc;
};
