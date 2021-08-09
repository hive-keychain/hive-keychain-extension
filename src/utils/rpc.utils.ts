import { Rpc } from 'src/interfaces/rpc.interface';
import { DefaultRpcs } from 'src/reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

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
  LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.RPC_LIST, [
    ...(savedCustomRpc ? savedCustomRpc : []),
    rpc,
  ]);
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

const saveCustomRpc = (rpcs: Rpc[]) => {
  LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.RPC_LIST, rpcs);
};

const saveCurrentRpc = (rpc: Rpc) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
    rpc,
  );
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
};

export default RpcUtils;
