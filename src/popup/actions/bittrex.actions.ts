import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import BittRexUtils from 'src/utils/bittrex.utils';

export const loadBittrexPrices = (): AppThunk => async (dispatch) => {
  try {
    const prices = await BittRexUtils.getBittrexPrices();
    dispatch({
      type: ActionType.LOAD_BITTREX_PRICES,
      payload: prices,
    });
  } catch (e) {
    // Logger.error('bittrex error', e.toString());
  }
};
