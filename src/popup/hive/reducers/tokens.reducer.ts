import { Token } from '@interfaces/tokens.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const TokensReducer = (
  state: Token[] = [],
  { type, payload }: ActionPayload<Token[]>,
) => {
  switch (type) {
    case HiveActionType.LOAD_TOKENS:
      return payload!;
    default:
      return state;
  }
};

export default TokensReducer;
