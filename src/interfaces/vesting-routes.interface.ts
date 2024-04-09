export interface VestingRoute {
  id: number;
  fromAccount: string;
  toAccount: string;
  percent: number;
  autoVest: boolean;
}

export interface UserLastCurrentRoutes {
  account: string;
  lastRoutes: VestingRoute[];
  currentRoutes: VestingRoute[];
}

export interface UserVestingRoute {
  account: string;
  routes: VestingRoute[];
}
