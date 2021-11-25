import KeychainApi from '@api/keychain';

export const getPhishingAccounts = async () => {
  return (await KeychainApi.get('/hive/phishingAccounts')).data;
};
