import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import HiveUtils from 'src/utils/hive.utils';

export const fetchConversionRequests =
  (name: string): AppThunk =>
  async (dispatch) => {
    const conversions = await HiveUtils.getConversionRequests(name);
    console.log({ conversions }); //TODO to remove
    dispatch({
      type: ActionType.FETCH_CONVERSION_REQUESTS,
      payload: conversions,
    });
  };
