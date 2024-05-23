import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';
import { AppThunk } from '@popup/multichain/actions/interfaces';

export const fetchPrices = (): AppThunk => async (dispatch) => {
  dispatch({
    type: EvmActionType.SET_APP_STATUS,
    payload: { priceLoaded: true } as EvmAppStatus,
  });
};
