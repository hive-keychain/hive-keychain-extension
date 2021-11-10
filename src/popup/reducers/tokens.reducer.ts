import { Token } from '@interfaces/tokens.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

const TokensReducer = (
  state: Token[] = [],
  { type, payload }: ActionPayload<Token[]>,
) => {
  switch (type) {
    case ActionType.LOAD_TOKENS:
      return payload!;
    default:
      return state;
  }
};

export default TokensReducer;
