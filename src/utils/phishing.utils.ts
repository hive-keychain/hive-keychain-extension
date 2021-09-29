import KeychainApi from '@popup/api/keychain';

export const getPhishingAccounts = async () => {
  return (await KeychainApi.get('/hive/phishingAccounts')).data;
};
