import { PendingUnstaking } from '@interfaces/tokens.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const TokensPendingUnstakingReducer = (
  state: PendingUnstaking[] = [],
  { type, payload }: ActionPayload<PendingUnstaking[]>,
) => {
  switch (type) {
    case HiveActionType.LOAD_PENDING_UNSTAKING:
      // Hive Engine responses must be an array; bad/mocked payloads must not break UI.
      return Array.isArray(payload) ? payload : [];
    default:
      return state;
  }
};

export default TokensPendingUnstakingReducer;
