import { PendingUnstaking } from '@interfaces/tokens.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

const TokensPendingUnstakingReducer = (
  state: PendingUnstaking[] = [],
  { type, payload }: ActionPayload<PendingUnstaking[]>,
) => {
  switch (type) {
    case ActionType.LOAD_PENDING_UNSTAKING:
      return payload;
    default:
      return state;
  }
};

export default TokensPendingUnstakingReducer;
