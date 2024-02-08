import { Rpc } from '@interfaces/rpc.interface';
import { ActionType } from '@popup/hive/actions/action-type.enum';

export const setSwitchToRpc = (rpc: Rpc) => {
  return {
    type: ActionType.SET_SWITCH_TO_RPC,
    payload: rpc,
  };
};

export const setDisplayChangeRpcPopup = (display: boolean) => {
  return {
    type: ActionType.SET_DISPLAY_SWITCH_RPC,
    payload: display,
  };
};
