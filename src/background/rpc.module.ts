import KeychainApi from '@api/keychain';
import { Client } from '@hiveio/dhive/lib/index-browser';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config as HiveTxConfig } from 'hive-tx';
import { Rpc } from 'src/interfaces/rpc.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const init = async () => {
  const rpc = await RPCModule.getActiveRpc();
  HiveTxConfig.node =
    rpc.uri === 'DEFAULT'
      ? (await KeychainApi.get('/hive/rpc')).data.rpc
      : rpc.uri;
  if (rpc.chainId) {
    HiveTxConfig.chain_id = rpc.chainId;
  }
};

const setActiveRpc = async (rpc: Rpc) => {
  HiveTxConfig.node =
    rpc.uri === 'DEFAULT'
      ? (await KeychainApi.get('/hive/rpc')).data.rpc
      : rpc.uri;
  if (rpc.chainId) {
    HiveTxConfig.chain_id = rpc.chainId;
  }
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

const getClient = (overridingRpc?: Rpc): Promise<Client> => {
  console.log(HiveTxConfig.node);
  return new Promise(async (fulfill) => {
    const rpc = overridingRpc || (await getActiveRpc());
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
  init,
};

export default RPCModule;
