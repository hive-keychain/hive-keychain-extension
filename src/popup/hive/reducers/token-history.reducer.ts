import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { TokenTransaction } from 'src/interfaces/tokens.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

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
