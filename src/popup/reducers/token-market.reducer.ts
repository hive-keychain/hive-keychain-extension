import { TokenMarket } from '@interfaces/tokens.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

const TokenMarketReducer = (
  state: TokenMarket[] = [],
  { type, payload }: ActionPayload<TokenMarket[]>,
) => {
  switch (type) {
    case ActionType.LOAD_TOKENS_MARKET:
      return payload!;
    default:
      return state;
  }
};

export default TokenMarketReducer;
