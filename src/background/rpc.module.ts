import { Client } from '@hiveio/dhive/lib/index-browser';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Rpc } from 'src/interfaces/rpc.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
const setActiveRpc = async (rpc: Rpc) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
    rpc,
  );
};

const getActiveRpc = async (): Promise<Rpc> => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
};

const getClient = (): Promise<Client> => {
  return new Promise(async (fulfill) => {
    const rpc = await getActiveRpc();
    console.log('rpc', rpc);
    if (rpc.uri === 'DEFAULT') {
      const res = await fetch('https://api.hive-keychain.com/hive/rpc');
      const json = await res.json();
      fulfill(
        new Client(json.rpc, {
          chainId: rpc.chainId,
        }),
      );
    } else {
      fulfill(
        new Client(rpc.uri, {
          chainId: rpc.chainId,
        }),
      );
    }
  });
};

const RPCModule = {
  setActiveRpc,
  getActiveRpc,
  getClient,
};

export default RPCModule;
