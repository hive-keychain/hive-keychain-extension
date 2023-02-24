import { KeychainApi } from '@api/keychain';
import axios from 'axios';

const getPrices = async () => {
  return (await KeychainApi.get('hive/v2/price')).data;
};

const getBittrexCurrency = async (currency: string) => {
  const response = (
    await axios.get('https://api.bittrex.com/api/v1.1/public/getcurrencies')
  ).data;

  if (response.success) {
    return response.result.find((c: any) => c.Currency == currency);
  }
  return null;
};

const CurrencyPricesUtils = {
  getBittrexCurrency,
  getPrices,
};

export default CurrencyPricesUtils;
