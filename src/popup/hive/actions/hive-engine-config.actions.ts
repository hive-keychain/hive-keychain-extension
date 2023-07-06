import { HiveEngineConfigUtils } from '@hiveapp/utils/hive-engine-config.utils';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { AppThunk } from 'src/popup/hive/actions/interfaces';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const setHEActiveRpc = (rpc: string) => {
  HiveEngineConfigUtils.setActiveApi(rpc);
  return {
    type: ActionType.HE_SET_ACTIVE_RPC,
    payload: { rpc: rpc },
  };
};

export const setHEActiveAccountHistoryApi = (api: string) => {
  HiveEngineConfigUtils.setActiveAccountHistoryApi(api);
  return {
    type: ActionType.HE_SET_ACTIVE_ACCOUNT_HISTORY_API,
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
        type: ActionType.HE_LOAD_CONFIG,
        payload: config,
      });
    }
  };
