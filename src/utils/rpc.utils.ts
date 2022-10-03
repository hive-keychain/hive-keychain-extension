import axios from 'axios';
import { Rpc } from 'src/interfaces/rpc.interface';
import { DefaultRpcs } from 'src/reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getFullList = (): Rpc[] => {
  return DefaultRpcs;
};

const isDefault = (rpc: Rpc): boolean => {
  return DefaultRpcs.find((r: Rpc) => r.uri === rpc.uri) !== undefined;
};

const getCustomRpcs = async (): Promise<Rpc[]> => {
  const customRpcs: Rpc[] = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.RPC_LIST,
  );
  return customRpcs ? customRpcs : ([] as Rpc[]);
};

const addCustomRpc = async (rpc: Rpc): Promise<void> => {
  const savedCustomRpc = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.RPC_LIST,
  );
  const newRpcList = savedCustomRpc ? savedCustomRpc : [];
  newRpcList.push(rpc);
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.RPC_LIST,
    newRpcList,
  );
};

const deleteCustomRpc = (rpcs: Rpc[], rpc: Rpc) => {
  const newRpcs = rpcs.filter((r) => rpc.uri !== r.uri);
  saveCustomRpc(newRpcs);
  return newRpcs;
};

const getCurrentRpc = async (): Promise<Rpc> => {
  const currentRpc = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
  return currentRpc ? currentRpc : { uri: 'DEFAULT', testnet: false };
};
/* istanbul ignore next */
const saveCustomRpc = (rpcs: Rpc[]) => {
  LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.RPC_LIST, rpcs);
};
/* istanbul ignore next */
const saveCurrentRpc = (rpc: Rpc) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
    rpc,
  );
};

const findRpc = async (uri: string) => {
  const list = [...getFullList(), ...(await RpcUtils.getCustomRpcs())];
  return list.find(
    (e) => e.uri === uri || e.uri === uri + '/' || e.uri + '/' === uri,
  );
};

const checkRpcStatus = async (uri: string) => {
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      throw new Error('RPC NOK');
    },
  );
  try {
    await axios.get(
      `${uri === 'DEFAULT' ? 'https://api.hive.blog' : uri}/health`,
    );
    return true;
  } catch (err) {
    Logger.error(err);
    return false;
  }
};

const RpcUtils = {
  getFullList,
  addCustomRpc,
  getCurrentRpc,
  saveCurrentRpc,
  getCustomRpcs,
  isDefault,
  saveCustomRpc,
  deleteCustomRpc,
  findRpc,
  checkRpcStatus,
};

export default RpcUtils;
