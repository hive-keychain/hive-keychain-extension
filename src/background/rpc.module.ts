import { KeychainApi } from '@api/keychain';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config as HiveTxConfig } from 'hive-tx';
import { Rpc } from 'src/interfaces/rpc.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const init = async () => {
  const rpc = await RPCModule.getActiveRpc();
  if (!rpc || rpc.uri === 'DEFAULT') {
    const res = await KeychainApi.get('hive/rpc');
    HiveTxConfig.node = res?.rpc;
  } else {
    HiveTxConfig.node = rpc.uri;
    if (rpc.chainId) {
      HiveTxConfig.chain_id = rpc.chainId;
    }
  }
};

const setActiveRpc = async (rpc: Rpc) => {
  if (!rpc || rpc.uri === 'DEFAULT') {
    HiveTxConfig.node = (await KeychainApi.get('hive/rpc')).rpc;
  } else {
    HiveTxConfig.node = rpc.uri;
    if (rpc.chainId) {
      HiveTxConfig.chain_id = rpc.chainId;
    }
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

const RPCModule = {
  setActiveRpc,
  getActiveRpc,
  init,
};

export default RPCModule;
