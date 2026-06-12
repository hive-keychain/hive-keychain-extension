import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
  HiveEngineConfig,
} from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BgdHiveEngineConfigModule } from 'src/background/hive/modules/hive-engine-config.module';
import { ArrayUtils } from 'src/utils/array.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

let rpc = 'https://api.hive-engine.com/rpc';

let accountHistoryApi = 'https://history.hive-engine.com';

(async () => {
  const config = await BgdHiveEngineConfigModule.getActiveConfig();
  if (config?.rpc) {
    rpc = config.rpc;
  }
  if (config?.accountHistoryApi) {
    accountHistoryApi = config.accountHistoryApi;
  }
})();

const getApi = () => {
  return rpc;
};
const setActiveApi = (api: string) => {
  rpc = api;
};

const getAccountHistoryApi = () => {
  return accountHistoryApi;
};
const setActiveAccountHistoryApi = (api: string) => {
  accountHistoryApi = api;
};

const addCustomRpc = async (api: string) => {
  const savedCustomRpcs = await HiveEngineConfigUtils.getCustomRpcs();
  savedCustomRpcs.push(api);
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
    savedCustomRpcs,
  );
};
const deleteCustomRpc = async (api: string) => {
  let customRpcs = (await getCustomRpcs()).filter((rpc) => rpc !== api);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
    customRpcs,
  );
  return customRpcs;
};
const getCustomRpcs = async () => {
  const customRpcs: string[] = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
  );
  return customRpcs ? customRpcs : ([] as string[]);
};

const getFullRpcList = async () => {
  return ArrayUtils.mergeWithoutDuplicate(
    await getCustomRpcs(),
    DefaultHiveEngineRpcs,
  ) as string[];
};

const checkRpcStatus = async (
  api: string,
  timeoutInSeconds: number = 3,
): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, timeoutInSeconds * 1000);

    fetch(`${api}/contracts`, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'find',
        params: {
          contract: 'tokens',
          table: 'tokens',
          query: {},
          limit: 1,
        },
        id: 1,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (res?.status === 200) {
          return res.json();
        }
      })
      .then((res: any) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(Array.isArray(res?.result));
        }
      })
      .catch(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(false);
        }
      });
  });
};
const getCustomAccountHistoryApi = async () => {
  const customAccountHistoryApis: string[] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
    );
  return customAccountHistoryApis ? customAccountHistoryApis : ([] as string[]);
};
const addCustomAccountHistoryApi = async (api: string) => {
  const savedCustomAccountHistoryApis =
    await HiveEngineConfigUtils.getCustomAccountHistoryApi();
  savedCustomAccountHistoryApis.push(api);
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
    savedCustomAccountHistoryApis,
  );
};
const deleteCustomAccountHistoryApi = async (api: string) => {
  let customHistoryAccountsApi = (await getCustomAccountHistoryApi()).filter(
    (rpc) => rpc !== api,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
    customHistoryAccountsApi,
  );
  return customHistoryAccountsApi;
};

const isRpcDefault = (rpc: string) => {
  return DefaultHiveEngineRpcs.includes(rpc);
};

const isAccountHistoryApiDefault = (api: string) => {
  return DefaultAccountHistoryApis.includes(api);
};

const saveConfigInStorage = async (config: HiveEngineConfig) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
    config,
  );
};

export const HiveEngineConfigUtils = {
  getApi,
  setActiveAccountHistoryApi,
  setActiveApi,
  getAccountHistoryApi,
  addCustomRpc,
  addCustomAccountHistoryApi,
  deleteCustomRpc,
  deleteCustomAccountHistoryApi,
  getCustomRpcs,
  getFullRpcList,
  checkRpcStatus,
  getCustomAccountHistoryApi,
  isRpcDefault,
  isAccountHistoryApiDefault,
  saveConfigInStorage,
};
