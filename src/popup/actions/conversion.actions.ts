import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
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
