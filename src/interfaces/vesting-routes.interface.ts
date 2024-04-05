export interface VestingRoute {
  id: number;
  from_account: string;
  to_account: string;
  percent: number;
  auto_vest: boolean;
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
