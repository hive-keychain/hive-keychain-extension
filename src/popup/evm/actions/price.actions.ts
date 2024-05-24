import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EVMTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CoingeckoApi } from 'src/api/coingecko';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const fetchPrices =
  (chain: EvmChain): AppThunk =>
  async (dispatch) => {
    const chainsTokensMetadata =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.EVM_TOKENS_METADATA,
      );

    const tokensMetadata = chainsTokensMetadata[chain.chainId];

    console.log({ tokensMetadata });

    let prices: any = {};
    if (tokensMetadata) {
      try {
        const res = await CoingeckoApi.get(
          'simple/price',
          `ids=${tokensMetadata
            .filter(
              (tm: EVMTokenInfoShort) => chain.testnet || !tm.possibleSpam,
            )
            .map((tm: EVMTokenInfoShort) => tm.coingeckoId)
            .join(',')}&vs_currencies=usd`,
        );

        for (const token of tokensMetadata) {
          prices[token.symbol] =
            token.coingeckoId || res[token.coingeckoId]
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
