import KeychainApi from '@popup/api/keychain';

export const getBittrexPrices = async () => {
  return (await KeychainApi.get('/hive/v2/bittrex')).data;
};
