import { Token } from '@interfaces/tokens.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ActionPayload } from 'src/popup/hive/actions/interfaces';

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
