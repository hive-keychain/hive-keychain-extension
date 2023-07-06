import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { Rpc } from 'src/interfaces/rpc.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

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
