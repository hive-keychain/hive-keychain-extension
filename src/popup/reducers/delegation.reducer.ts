import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { Delegations } from 'src/interfaces/delegations.interface';

const DelegationsReducer = (
  state: Delegations = { incoming: [], outgoing: [] },
  { type, payload }: actionPayload<Delegations>,
) => {
  switch (type) {
    case ActionType.FETCH_DELEGATEES:
      return { ...state, outgoing: payload!.outgoing };
    case ActionType.FETCH_DELEGATORS:
      return { ...state, incoming: payload!.incoming };
    default:
      return state;
  }
};

export default DelegationsReducer;
