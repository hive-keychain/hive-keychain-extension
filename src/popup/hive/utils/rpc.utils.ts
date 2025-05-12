import axios from 'axios';
import { Rpc } from 'src/interfaces/rpc.interface';
import { DefaultRpcs } from 'src/reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getFullList = (): Rpc[] => {
  return DefaultRpcs.map((rpc: Rpc) => {
    return {
      ...rpc,
      uri: rpc.uri.endsWith('/')
        ? rpc.uri.substring(0, rpc.uri.length - 1)
        : rpc.uri,
    };
  });
};

const isDefault = (rpc: Rpc): boolean => {
  return (
    DefaultRpcs.find((r: Rpc) => {
      const defaultUri = r.uri.trim().endsWith('/')
        ? r.uri.trim().substring(0, r.uri.trim().length - 1)
        : r.uri.trim();
      const uri = rpc.uri.trim().endsWith('/')
        ? rpc.uri.trim().substring(0, rpc.uri.trim().length - 1)
        : rpc.uri.trim();
      return defaultUri === uri;
    }) !== undefined
  );
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
  let currentRpc = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
  currentRpc = currentRpc ? currentRpc : { uri: 'DEFAULT', testnet: false };
  if (currentRpc.uri.endsWith('/'))
    currentRpc = {
      ...currentRpc,
      uri: currentRpc.uri.substring(0, currentRpc.uri.length - 1),
    };

  return currentRpc;
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
      throw new Error('RPC NOK ' + uri + ' ' + error);
    },
  );
  try {
    const result = await axios.get(
      ['DEFAULT', 'https://api.hive.blog'].includes(uri)
        ? 'https://api.hive.blog'
        : `${uri}/health`,
      {
        timeout: 10000,
      },
    );
    if (result?.data?.error) {
      return false;
    }
    return true;
  } catch (err) {
    Logger.error('error', err);
    return false;
  }
};

// const test = async () => {
//   const list = [...getFullList(), ...(await RpcUtils.getCustomRpcs())];
//   for (const rpc of list) {
//     try {
//       const start = Date.now();
//       await HiveTxUtils.setRpc(rpc);
//       const res = await HiveTxUtils.getData(
//         'transaction_status_api.find_transaction',
//         { transaction_id: 'f5178d311dd17927d460e8674cabd074df8e24fe' },
//       );
//       const end = Date.now();
//       if (res.status) {
//         console.log(`${rpc.uri} responded in ${end - start}ms`);
//       } else {
//         console.log(`${rpc.uri} responded without status`);
//       }
//     } catch (e) {
//       console.log(`${rpc.uri} had an error`, e);
//     }
//   }
// };

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
