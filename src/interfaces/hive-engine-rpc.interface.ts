export interface HiveEngineConfig {
  rpc: string;
  mainnet: string;
  accountHistoryApi: string;
}

export const DefaultHiveEngineRpcs: HiveEngineConfig['rpc'][] = [
  'https://api.hive-engine.com/rpc',
  'https://herpc.dtools.dev',
  'https://api.primersion.com',
  'https://ha.herpc.dtools.dev',
  'https://api2.hive-engine.com/rpc',
  'https://he.atexoras.com:2083',
];

export const DefaultAccountHistoryApis: HiveEngineConfig['accountHistoryApi'][] =
  ['https://history.hive-engine.com', 'https://he.atexoras.com:8443'];
