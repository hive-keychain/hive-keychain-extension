import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/actions/interfaces';
import { AppStatus } from '@popup/reducers/app-status.reducer';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';
import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

export const loadGlobalProperties = (): AppThunk => async (dispatch) => {
  try {
    const [globals, price, rewardFund] = await Promise.all([
      DynamicGlobalPropertiesUtils.getDynamicGlobalProperties(),
      HiveUtils.getCurrentMedianHistoryPrice(),
      HiveUtils.getRewardFund(),
    ]);
    const props = { globals, price, rewardFund };
    const action: ActionPayload<GlobalProperties> = {
      type: ActionType.LOAD_GLOBAL_PROPS,
      payload: props,
    };
    dispatch(action);
    dispatch({
      type: ActionType.SET_APP_STATUS,
      payload: { globalPropertiesLoaded: true } as AppStatus,
    });
  } catch (err) {
    Logger.error(err);
  }
};
