import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import { getBittrexPrices } from 'src/utils/bittrex.utils';
import Logger from 'src/utils/logger.utils';

export const loadBittrexPrices = (): AppThunk => async (dispatch) => {
  try {
    const prices = await getBittrexPrices();
    dispatch({
      type: ActionType.LOAD_BITTREX_PRICES,
      payload: prices,
    });
  } catch (e) {
    Logger.error('bittrex error', e);
  }
};
