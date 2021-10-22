import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { Rpc } from 'src/interfaces/rpc.interface';

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
