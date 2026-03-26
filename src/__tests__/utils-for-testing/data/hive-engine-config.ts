import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';

const byDefault = {
  rpc: 'https://api.hive-engine.com/rpc',
  mainnet: 'ssc-mainnet-hive',
  accountHistoryApi: 'https://history.hive-engine.com/',
  maxSpread: 100,
} as HiveEngineConfig;

export const HiveEngineConfigData = { byDefault };
