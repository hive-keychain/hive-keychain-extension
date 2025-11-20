import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const fetchPrices = async (tokensMetadata: EvmSmartContractInfo[]) => {
  let prices: any = {};
  if (tokensMetadata && tokensMetadata.length > 0) {
    try {
      throw new Error('test');
      // const res = await CoingeckoApi.get(
      //   'simple/price',
      //   `ids=${tokensMetadata
      //     .filter(
      //       (tm: EvmSmartContractInfo) =>
      //         !!tm.coingeckoId && tm.coingeckoId.length > 0,
      //     )
      //     .map((tm: EvmSmartContractInfo) => tm.coingeckoId)
      //     .join(',')}&vs_currencies=usd`,
      // );

      // for (const token of tokensMetadata) {
      //   prices[token.symbol.toLowerCase()] =
      //     (token.coingeckoId && token.coingeckoId?.length > 0) ||
      //     (token.coingeckoId && res[token.coingeckoId])
      //       ? res[token.coingeckoId]
      //       : { usd: 0 };
      // }

      // await savePrice(prices);

      // return prices;
    } catch (err) {
      Logger.error('Error while fetching prices', err);
      return getPrices();
    }
  }
};

const savePrice = async (newPrices: EvmPrices) => {
  const prices = await getPrices();
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_PRICE,
    { ...prices, ...newPrices },
  );
};

const getPrices = async () => {
  const prices = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_PRICE,
  );
  return prices ?? ({} as EvmPrices);
};

export const EvmPricesUtils = { fetchPrices, getPrices, savePrice };
