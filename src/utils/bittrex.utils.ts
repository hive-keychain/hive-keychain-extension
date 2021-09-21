import KeychainApi from '@popup/api/keychain';
import axios from 'axios';

const getBittrexPrices = async () => {
  return (await KeychainApi.get('/hive/v2/bittrex')).data;
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

const BittRexUtils = {
  getBittrexCurrency,
  getBittrexPrices,
};

export default BittRexUtils;
