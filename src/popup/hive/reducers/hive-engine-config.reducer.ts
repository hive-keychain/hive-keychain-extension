import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import Config from 'src/config';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const HiveEngineConfigReducer = (
  state: HiveEngineConfig = {
    rpc: Config.hiveEngine.rpc,
    mainnet: Config.hiveEngine.mainnet,
    accountHistoryApi: Config.hiveEngine.accountHistoryApi,
  },
  { type, payload }: ActionPayload<Partial<HiveEngineConfig>>,
): HiveEngineConfig => {
  switch (type) {
    case HiveActionType.HE_SET_ACTIVE_ACCOUNT_HISTORY_API:
      return { ...state, accountHistoryApi: payload?.accountHistoryApi! };
    case HiveActionType.HE_SET_ACTIVE_RPC:
      return { ...state, rpc: payload?.rpc! };
    case HiveActionType.HE_LOAD_CONFIG:
      return {
        ...state,
        rpc: payload?.rpc!,
        accountHistoryApi: payload?.accountHistoryApi!,
      };
    default:
      return state;
  }
};

export default HiveEngineConfigReducer;
