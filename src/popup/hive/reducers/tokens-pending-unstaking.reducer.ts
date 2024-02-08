import { PendingUnstaking } from '@interfaces/tokens.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

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
