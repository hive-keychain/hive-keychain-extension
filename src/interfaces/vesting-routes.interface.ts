export interface VestingRoute {
  id: number;
  fromAccount: string;
  toAccount: string;
  percent: number;
  autoVest: boolean;
}

export interface UserVestingRoute {
  account: string;
  routes: VestingRoute[];
  routesChanged?: VestingRoute[];
}
