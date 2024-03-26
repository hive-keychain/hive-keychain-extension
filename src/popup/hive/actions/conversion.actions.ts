import { AppThunk } from '@popup/multichain/actions/interfaces';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { ConversionUtils } from 'src/popup/hive/utils/conversion.utils';

export const fetchConversionRequests =
  (name: string): AppThunk =>
  async (dispatch) => {
    const conversions = await ConversionUtils.getConversionRequests(name);
    dispatch({
      type: ActionType.FETCH_CONVERSION_REQUESTS,
      payload: conversions,
    });
  };
