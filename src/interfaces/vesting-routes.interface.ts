export interface NonExistenVestingRoute {
  id: number;
  status: 'non existent';
}
export interface VestingRoute {
  id: number;
  fromAccount: string;
  toAccount: string;
  percent: number;
  autoVest: boolean;
  nonExistent?: boolean;
}

export interface AccountVestingRoute {
  account: string;
  lastRoutes: VestingRoute[] | NonExistenVestingRoute[];
  newRoutes: VestingRoute[] | NonExistenVestingRoute[];
}

//TODO bellow remove interface
export interface UserVestingRoute {
  account: string;
  routes: VestingRoute[];
  routesChanged?: VestingRoute[];
}
