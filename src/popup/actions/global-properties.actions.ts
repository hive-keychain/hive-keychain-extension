import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/actions/interfaces';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';
import HiveUtils from 'src/utils/hive.utils';

export const loadGlobalProperties = (): AppThunk => async (dispatch) => {
  const [globals, price, rewardFund] = await Promise.all([
    HiveUtils.getClient().database.getDynamicGlobalProperties(),
    HiveUtils.getClient().database.getCurrentMedianHistoryPrice(),
    HiveUtils.getClient().database.call('get_reward_fund', ['post']),
  ]);
  const props = { globals, price, rewardFund };
  const action: ActionPayload<GlobalProperties> = {
    type: ActionType.LOAD_GLOBAL_PROPS,
    payload: props,
  };
  dispatch(action);
};
