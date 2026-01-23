import { KeychainApi } from '@api/keychain';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const fetchPrices = async (tokensMetadata: EvmSmartContractInfo[]) => {
  let prices: any = {};
  if (tokensMetadata && tokensMetadata.length > 0) {
    try {
      const res = await KeychainApi.post(`evm/v2/price`, {
        coingeckoIds: tokensMetadata.map((tm: EvmSmartContractInfo) => tm.coingeckoId),
      });
      return res;
      
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
