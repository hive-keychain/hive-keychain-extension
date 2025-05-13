import { KeychainApi } from '@api/keychain';
import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { TokenMarket } from '@interfaces/tokens.interface';
import { BaseCurrencies } from '@popup/hive/utils/currency.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const getPrices = async () => {
  let prices;
  try {
    prices = await KeychainApi.get('hive/v2/price');
    if (prices) {
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.LAST_PRICE,
        prices,
      );
    } else {
      Logger.error('Cannot fetch prices from API. Using last known price...');
      prices = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.LAST_PRICE,
      );
    }
  } catch (err) {
    Logger.error(
      'Cannot fetch prices from API. Using last known price...',
      err,
    );
    prices = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_PRICE,
    );
  } finally {
    return prices ?? {};
  }
};

const getBittrexCurrency = async (currency: string) => {
  const response = await fetch(
    'https://api.bittrex.com/api/v1.1/public/getcurrencies',
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  if (response.status === 200) {
    return (await response.json()).find((c: any) => c.Currency == currency);
  }
  return null;
};

const getTokenUSDPrice = (
  estimateValue: string | undefined,
  symbol: string,
  price: CurrencyPrices,
  tokenMarket: TokenMarket[],
) => {
  if (!estimateValue) return '';
  else {
    let tokenPrice;
    if (symbol === BaseCurrencies.HIVE.toUpperCase()) {
      tokenPrice = price.hive.usd!;
    } else if (symbol === BaseCurrencies.HBD.toUpperCase()) {
      tokenPrice = price.hive_dollar.usd!;
    } else {
      tokenPrice =
        TokensUtils.getHiveEngineTokenPrice(
          {
            symbol,
          },
          tokenMarket,
        ) * price.hive.usd!;
    }
    return `≈ $${FormatUtils.withCommas(
      Number.parseFloat(estimateValue) * tokenPrice + '',
      2,
    )}`;
  }
};

const CurrencyPricesUtils = {
  getBittrexCurrency,
  getPrices,
  getTokenUSDPrice,
};

export default CurrencyPricesUtils;
