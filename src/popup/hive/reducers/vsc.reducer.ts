import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { LoadingState, VscAccountBalance } from 'hive-keychain-commons';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

export type VscAccountBalanceState =
  | {
      state: LoadingState.FAILED | LoadingState.LOADING;
    }
  | {
      state: LoadingState.LOADED;
      balance: VscAccountBalance;
    };
const VscReducer = (
  state: VscAccountBalanceState = { state: LoadingState.LOADING },
  { type, payload }: ActionPayload<VscAccountBalance>,
): VscAccountBalanceState => {
  switch (type) {
    case HiveActionType.LOAD_VSC_ACCOUNT_BALANCE:
      return { state: LoadingState.LOADING };
    case HiveActionType.VSC_ACCOUNT_LOADED:
      return { state: LoadingState.LOADED, balance: payload! };
    case HiveActionType.VSC_ACCOUNT_ERROR:
      return { state: LoadingState.FAILED };
    default:
      return state;
  }
};

export default VscReducer;
