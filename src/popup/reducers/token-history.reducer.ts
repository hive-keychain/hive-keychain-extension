import { ActionType } from '@popup/actions/action-type.enum';
import { actionPayload } from '@popup/actions/interfaces';
import { TokenTransaction } from 'src/interfaces/tokens.interface';

const TokenHistoryReducer = (
  state: TokenTransaction[] = [],
  { type, payload }: actionPayload<TokenTransaction[]>,
) => {
  switch (type) {
    case ActionType.LOAD_TOKEN_HISTORY:
      return payload!;
    default:
      return state;
  }
};

export default TokenHistoryReducer;
