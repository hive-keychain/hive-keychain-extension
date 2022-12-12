import { ActionType } from '@popup/actions/action-type.enum';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { Rpc } from 'src/interfaces/rpc.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

export const setActiveRpc = (rpc: Rpc) => {
  HiveTxUtils.setRpc(rpc);
  chrome.runtime.sendMessage({
    command: BackgroundCommand.SAVE_RPC,
    value: rpc,
  });
  return {
    type: ActionType.SET_ACTIVE_RPC,
    payload: rpc,
  };
};
