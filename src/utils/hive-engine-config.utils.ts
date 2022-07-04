import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
} from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import axios from 'axios';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import SSC from 'sscjs';

let hiveEngineAPI = new SSC('https://api.hive-engine.com/rpc');

let historyHiveEngineAPI = axios.create({
  baseURL: 'https://history.hive-engine.com/',
});

const getApi = () => {
  return hiveEngineAPI;
};
const setActiveApi = (api: string) => {
  hiveEngineAPI = new SSC(api);
};

const getAccountHistoryApi = () => {
  return historyHiveEngineAPI;
};
const setActiveAccountHistoryApi = (api: string) => {
  hiveEngineAPI = axios.create({
    baseURL: api,
  });
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
const getCustomAccountHistoryApi = async () => {
  const customAccountHistoryApis: string[] =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
    );
  return customAccountHistoryApis ? customAccountHistoryApis : ([] as string[]);
};
const addCustomAccountHistoryApi = async (api: string) => {
  const savedCustomAccountHistoryApis =
    await HiveEngineConfigUtils.getCustomRpcs();
  savedCustomAccountHistoryApis.push(api);
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
    savedCustomAccountHistoryApis,
  );
};
const deleteCustomAccountHistoryApi = async (api: string) => {
  let customHistoryAccountsApi = (await getCustomRpcs()).filter(
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
  getCustomAccountHistoryApi,
  isRpcDefault,
  isAccountHistoryApiDefault,
};
