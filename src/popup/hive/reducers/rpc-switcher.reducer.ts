import { Rpc } from '@interfaces/rpc.interface';
import { HiveActionType } from '@popup/hive/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

type Switcher = {
  display: boolean;
  rpc?: Rpc;
  hiveEngineRpc?: string;
};
export const RpcSwitcherReducer = (
  state: Switcher = { display: false },
  { type, payload }: ActionPayload<boolean | Rpc | string>,
): Switcher => {
  switch (type) {
    case HiveActionType.SET_SWITCH_TO_RPC:
      return { ...state, rpc: payload as Rpc, hiveEngineRpc: undefined };
    case HiveActionType.SET_SWITCH_TO_HIVE_ENGINE_RPC:
      return { ...state, rpc: undefined, hiveEngineRpc: payload as string };
    case HiveActionType.SET_DISPLAY_SWITCH_RPC:
      return { ...state, display: payload as boolean };
    default:
      return state;
  }
};
