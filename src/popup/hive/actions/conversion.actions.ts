import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { AppThunk } from 'src/popup/hive/actions/interfaces';
import { ConversionUtils } from 'src/utils/conversion.utils';

export const fetchConversionRequests =
  (name: string): AppThunk =>
  async (dispatch) => {
    const conversions = await ConversionUtils.getConversionRequests(name);
    dispatch({
      type: ActionType.FETCH_CONVERSION_REQUESTS,
      payload: conversions,
    });
  };
