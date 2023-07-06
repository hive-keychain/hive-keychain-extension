import { Rpc } from 'src/interfaces/rpc.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

export const ActiveRpcReducer = (
  state: Rpc = { uri: 'NULL', testnet: false },
  { type, payload }: ActionPayload<Rpc>,
) => {
  switch (type) {
    case ActionType.SET_ACTIVE_RPC:
      return payload;
    default:
      return state;
  }
};
