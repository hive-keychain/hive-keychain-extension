import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { TokenTransaction } from 'src/interfaces/tokens.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

const TokenHistoryReducer = (
  state: {
    loading: boolean;
    shouldLoadMore: boolean;
    list: TokenTransaction[];
  } = {
    loading: false,
    shouldLoadMore: false,
    list: [],
  },
  {
    type,
    payload,
  }: ActionPayload<{
    transactions: TokenTransaction[];
    shouldLoadMore: boolean;
  }>,
) => {
  switch (type) {
    case HiveActionType.INIT_TOKEN_HISTORY:
      return { loading: true, list: [], shouldLoadMore: false };
    case HiveActionType.LOAD_TOKEN_HISTORY:
      return {
        loading: false,
        list: payload?.transactions!,
        shouldLoadMore: payload?.shouldLoadMore!,
      };
    case HiveActionType.FETCH_MORE_TOKEN_HISTORY:
      return {
        loading: false,
        list: [...state.list, ...payload?.transactions!],
        shouldLoadMore: payload?.shouldLoadMore!,
      };
    case HiveActionType.IS_LOADING:
      return { ...state, loading: true };

    default:
      return state;
  }
};

export default TokenHistoryReducer;
