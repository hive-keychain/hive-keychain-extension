import { Rpc } from '@interfaces/rpc.interface';
import { setActiveRpc } from '@popup/hive/actions/active-rpc.actions';
import { setHEActiveRpc } from '@popup/hive/actions/hive-engine-config.actions';
import {
  setDisplayChangeRpcPopup,
  setSwitchToHiveEngineRpc,
  setSwitchToRpc,
} from '@popup/hive/actions/rpc-switcher';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import RpcUtils from '@popup/hive/utils/rpc.utils';
import { store } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { AsyncUtils } from 'src/utils/async.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const useWorkingRPC = async (activeRpc?: Rpc) => {
  const switchAuto = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SWITCH_RPC_AUTO,
  );
  const currentRpc = activeRpc || (await store.getState().hive.activeRpc);
  for (const rpc of RpcUtils.getFullList().filter(
    (rpc) => rpc.uri !== currentRpc?.uri && !rpc.testnet,
  )) {
    await AsyncUtils.sleep(1000);
    if (await RpcUtils.checkRpcStatus(rpc.uri)) {
      if (switchAuto ?? true) {
        store.dispatch(setActiveRpc(rpc));
      } else {
        store.dispatch(setSwitchToRpc(rpc));
        store.dispatch(setDisplayChangeRpcPopup(true));
      }
      return rpc;
    }
  }
};

export const useWorkingHiveEngineRPC = async (activeRpc?: string) => {
  const switchAuto = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.HIVE_ENGINE_SWITCH_RPC_AUTO,
  );
  const currentRpc = activeRpc || HiveEngineConfigUtils.getApi();
  for (const rpc of (await HiveEngineConfigUtils.getFullRpcList()).filter(
    (rpc) => rpc !== currentRpc,
  )) {
    await AsyncUtils.sleep(1000);
    if (await HiveEngineConfigUtils.checkRpcStatus(rpc)) {
      if (switchAuto ?? true) {
        store.dispatch(setHEActiveRpc(rpc));
      } else {
        store.dispatch(setSwitchToHiveEngineRpc(rpc));
        store.dispatch(setDisplayChangeRpcPopup(true));
        return;
      }
      return rpc;
    }
  }
};
