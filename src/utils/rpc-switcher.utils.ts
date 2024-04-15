import { Rpc } from '@interfaces/rpc.interface';
import { setActiveRpc } from '@popup/hive/actions/active-rpc.actions';
import {
  setDisplayChangeRpcPopup,
  setSwitchToRpc,
} from '@popup/hive/actions/rpc-switcher';
import RpcUtils from '@popup/hive/utils/rpc.utils';
import { store } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const useWorkingRPC = async (activeRpc?: Rpc) => {
  const switchAuto = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SWITCH_RPC_AUTO,
  );
  const currentRpc = activeRpc || (await store.getState().hive.activeRpc);
  for (const rpc of RpcUtils.getFullList().filter(
    (rpc) => rpc.uri !== currentRpc?.uri && !rpc.testnet,
  )) {
    if (await RpcUtils.checkRpcStatus(rpc.uri)) {
      if (switchAuto) {
        store.dispatch(setActiveRpc(rpc));
      } else {
        store.dispatch(setSwitchToRpc(rpc));
        store.dispatch(setDisplayChangeRpcPopup(true));
      }
      return;
    }
  }
};
