import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Rpc } from 'src/interfaces/rpc.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const setActiveRpc = async (rpc: Rpc) => {
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
    rpc,
  );
};

const getActiveRpc = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CURRENT_RPC,
  );
};

const RPCModule = {
  setActiveRpc,
  getActiveRpc,
};

export default RPCModule;
