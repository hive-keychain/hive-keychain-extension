import { KeychainApi } from '@api/keychain';

const getPrices = async () => {
  return await KeychainApi.get('hive/v2/price');
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

const CurrencyPricesUtils = {
  getBittrexCurrency,
  getPrices,
};

export default CurrencyPricesUtils;
