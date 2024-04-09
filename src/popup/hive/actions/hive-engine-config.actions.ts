import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';
import { HiveEngineConfigUtils } from 'src/popup/hive/utils/hive-engine-config.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const setHEActiveRpc = (rpc: string) => {
  HiveEngineConfigUtils.setActiveApi(rpc);
  return {
    type: HiveActionType.HE_SET_ACTIVE_RPC,
    payload: { rpc: rpc },
  };
};

export const setHEActiveAccountHistoryApi = (api: string) => {
  HiveEngineConfigUtils.setActiveAccountHistoryApi(api);
  return {
    type: HiveActionType.HE_SET_ACTIVE_ACCOUNT_HISTORY_API,
    payload: { accountHistoryApi: api },
  };
};

export const initHiveEngineConfigFromStorage =
  (): AppThunk => async (dispatch) => {
    const config = (await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
    )) as HiveEngineConfig;
    if (config) {
      HiveEngineConfigUtils.setActiveAccountHistoryApi(
        config.accountHistoryApi,
      );
      HiveEngineConfigUtils.setActiveApi(config.rpc);
      dispatch({
        type: HiveActionType.HE_LOAD_CONFIG,
        payload: config,
      });
    }
  };
