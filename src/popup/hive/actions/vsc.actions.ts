import { HiveActionType } from '@popup/hive/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/multichain/actions/interfaces';
import { VscAccountBalance, VscUtils } from 'hive-keychain-commons';

export const loadVscAccountBalance =
  (username: string): AppThunk =>
  async (dispatch) => {
    let balance;
    dispatch({
      type: HiveActionType.LOAD_VSC_ACCOUNT_BALANCE,
    });
    try {
      balance = await VscUtils.getAccountBalance(username);
    } catch (err: any) {
      dispatch({
        type: HiveActionType.VSC_ACCOUNT_ERROR,
      });
    }

    const action: ActionPayload<VscAccountBalance> = {
      type: HiveActionType.VSC_ACCOUNT_LOADED,
      payload: balance,
    };
    dispatch(action);
  };
