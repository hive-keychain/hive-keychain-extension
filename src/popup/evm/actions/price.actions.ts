import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';
import { EvmPricesUtils } from '@popup/evm/utils/evm-prices.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import Logger from 'src/utils/logger.utils';

export const fetchPrices =
  (tokensMetadata: EvmSmartContractInfo[]): AppThunk =>
  async (dispatch) => {
    Logger.info('Fetching prices...');

    const prices = await EvmPricesUtils.fetchPrices(tokensMetadata);

    dispatch({
      type: EvmActionType.SET_PRICES,
      payload: prices,
    });

    dispatch({
      type: EvmActionType.SET_APP_STATUS,
      payload: { priceLoaded: true } as EvmAppStatus,
    });
  };
