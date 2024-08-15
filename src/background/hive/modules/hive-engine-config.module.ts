import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getActiveRpc = async () => {
  return (await getActiveConfig()).rpc;
};

const getActiveAccountHistoryApi = async () => {
  return (await getActiveConfig()).accountHistoryApi;
};

const getActiveMainnet = async () => {
  return (await getActiveConfig()).mainnet;
};

const getActiveConfig = async (): Promise<HiveEngineConfig> => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
  );
};

export const BgdHiveEngineConfigModule = {
  getActiveConfig,
  getActiveMainnet,
  getActiveRpc,
  getActiveAccountHistoryApi,
};
