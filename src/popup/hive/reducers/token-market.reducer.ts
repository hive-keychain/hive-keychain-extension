import { TokenMarket } from '@interfaces/tokens.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const TokenMarketReducer = (
  state: TokenMarket[] = [],
  { type, payload }: ActionPayload<TokenMarket[]>,
) => {
  switch (type) {
    case HiveActionType.LOAD_TOKENS_MARKET:
      return payload!;
    default:
      return state;
  }
};

export default TokenMarketReducer;
