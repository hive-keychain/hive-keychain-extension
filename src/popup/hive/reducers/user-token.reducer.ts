import { TokenBalance, UserTokens } from '@interfaces/tokens.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

const UserTokensReducer = (
  state: UserTokens = { loading: false, list: [] },
  { type, payload }: ActionPayload<TokenBalance[]>,
) => {
  switch (type) {
    case ActionType.CLEAR_USER_TOKENS:
      return { loading: true, list: [] };
    case ActionType.LOAD_USER_TOKENS:
      return { loading: false, list: payload! };
    default:
      return state;
  }
};

export default UserTokensReducer;
