import { ActionType } from '@popup/actions/action-type.enum';
import { Rpc } from 'src/interfaces/rpc.interface';
import HiveUtils from 'src/utils/hive.utils';

export const setActiveRpc = (rpc: Rpc) => {
  HiveUtils.setRpc(rpc);
  return {
    type: ActionType.SET_ACTIVE_RPC,
    payload: rpc,
  };
};
