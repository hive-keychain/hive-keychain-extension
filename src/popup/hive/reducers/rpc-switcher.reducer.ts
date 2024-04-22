import { Rpc } from '@interfaces/rpc.interface';
import { HiveActionType } from '@popup/hive/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

type Switcher = {
  display: boolean;
  rpc?: Rpc;
};
export const RpcSwitcherReducer = (
  state: Switcher = { display: false },
  { type, payload }: ActionPayload<boolean | Rpc>,
): Switcher => {
  switch (type) {
    case HiveActionType.SET_SWITCH_TO_RPC:
      return { ...state, rpc: payload as Rpc };
    case HiveActionType.SET_DISPLAY_SWITCH_RPC:
      return { ...state, display: payload as boolean };
    default:
      return state;
  }
};
