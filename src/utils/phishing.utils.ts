import KeychainApi from '@popup/api/keychain';

export const getPhishingAccounts = async () => {
  const test = await KeychainApi.get('/hive/phishingAccounts');
  console.log(test);
  return (await KeychainApi.get('/hive/phishingAccounts')).data;
};
