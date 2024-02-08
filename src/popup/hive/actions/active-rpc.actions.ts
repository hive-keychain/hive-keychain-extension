import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { Rpc } from 'src/interfaces/rpc.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';

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
