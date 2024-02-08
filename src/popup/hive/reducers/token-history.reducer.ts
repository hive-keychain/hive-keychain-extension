import { TokenTransaction } from 'src/interfaces/tokens.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

const TokenHistoryReducer = (
  state: TokenTransaction[] = [],
  { type, payload }: ActionPayload<TokenTransaction[]>,
) => {
  switch (type) {
    case ActionType.LOAD_TOKEN_HISTORY:
      return payload!;
    default:
      return state;
  }
};

export default TokenHistoryReducer;
