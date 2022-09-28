export interface HiveEngineConfig {
  rpc: string;
  mainnet: string;
  accountHistoryApi: string;
}

export const DefaultHiveEngineRpcs: HiveEngineConfig['rpc'][] = [
  'https://api.hive-engine.com/rpc',
  'https://api2.hive-engine.com/rpc',
  'https://ha.herpc.dtools.dev/',
  'https://herpc.dtools.dev',
  'https://engine.rishipanthee.com',
];
export const DefaultAccountHistoryApis: HiveEngineConfig['accountHistoryApi'][] =
  [
    'https://accounts.hive-engine.com/accountHistory',
    'https://enginehistory.rishipanthee.com',
  ];
