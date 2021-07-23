import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { Rpc } from 'src/interfaces/rpc.interface';

export const ActiveRpcReducer = (
  state: Rpc = { uri: 'NULL', testnet: false },
  { type, payload }: actionPayload<Rpc>,
) => {
  switch (type) {
    case ActionType.SET_ACTIVE_RPC:
      return payload;
    default:
      return state;
  }
};
