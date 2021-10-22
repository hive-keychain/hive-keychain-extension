import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { TokenTransaction } from 'src/interfaces/tokens.interface';

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
