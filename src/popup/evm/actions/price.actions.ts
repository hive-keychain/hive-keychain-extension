import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EVMTokenInfoShort } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAppStatus } from '@popup/evm/reducers/app-status.reducer';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CoingeckoApi } from 'src/api/coingecko';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export const fetchPrices =
  (chain: EvmChain): AppThunk =>
  async (dispatch) => {
    const chainsTokensMetadata =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.EVM_TOKENS_METADATA,
      );

    const tokensMetadata = chainsTokensMetadata[chain.chainId];

    let prices = {};
    if (tokensMetadata) {
      try {
        const res = await CoingeckoApi.get(
          'simple/price',
          `ids=${tokensMetadata
            .filter((tm: EVMTokenInfoShort) => !tm.possibleSpam)
            .map((tm: EVMTokenInfoShort) => tm.coingeckoId)
            .join(',')}&vs_currencies=usd&include_24hr_change=true`,
        );
        console.log(res);
      } catch (err) {
        console.log(err);
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
