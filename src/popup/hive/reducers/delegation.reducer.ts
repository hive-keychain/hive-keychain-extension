import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { Delegations } from 'src/interfaces/delegations.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const DelegationsReducer = (
  state: Delegations = {
    incoming: [],
    outgoing: [],
    pendingOutgoingUndelegation: [],
  },
  { type, payload }: ActionPayload<Delegations>,
) => {
  switch (type) {
    case HiveActionType.FETCH_DELEGATEES:
      return { ...state, outgoing: payload!.outgoing };
    case HiveActionType.FETCH_DELEGATORS:
      return { ...state, incoming: payload!.incoming };
    case HiveActionType.FETCH_PENDING_OUTGOING_UNDELEGATION:
      return {
        ...state,
        pendingOutgoingUndelegation: payload!.pendingOutgoingUndelegation,
      };
    default:
      return state;
  }
};

export default DelegationsReducer;
