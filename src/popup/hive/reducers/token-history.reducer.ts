import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { TokenTransaction } from 'src/interfaces/tokens.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const TokenHistoryReducer = (
  state: TokenTransaction[] = [],
  { type, payload }: ActionPayload<TokenTransaction[]>,
) => {
  switch (type) {
    case HiveActionType.LOAD_TOKEN_HISTORY:
      return payload!;
    default:
      return state;
  }
};

export default TokenHistoryReducer;
