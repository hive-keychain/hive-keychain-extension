import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { CoingeckoApi } from 'src/api/coingecko';
import Logger from 'src/utils/logger.utils';

export const fetchPrices =
  (tokensMetadata: EvmSmartContractInfo[]): AppThunk =>
  async (dispatch) => {
    Logger.info('Fetching prices...');

    let prices: any = {};
    if (tokensMetadata && tokensMetadata.length > 0) {
      try {
        const res = await CoingeckoApi.get(
          'simple/price',
          `ids=${tokensMetadata
            .filter(
              (tm: EvmSmartContractInfo) =>
                !!tm.coingeckoId && tm.coingeckoId.length > 0,
            )
            .map((tm: EvmSmartContractInfo) => tm.coingeckoId)
            .join(',')}&vs_currencies=usd`,
        );

        for (const token of tokensMetadata) {
          prices[token.symbol] =
            (token.coingeckoId && token.coingeckoId?.length > 0) ||
            (token.coingeckoId && res[token.coingeckoId])
              ? res[token.coingeckoId]
              : { usd: 0 };
        }
      } catch (err) {
        Logger.error('Error while fetching prices', err);
      }
    }

    dispatch({
      type: EvmActionType.SET_PRICES,
      payload: prices,
    });

    dispatch({
      type: EvmActionType.SET_APP_STATUS,
      payload: { priceLoaded: true } as EvmAppStatus,
    });
  };
