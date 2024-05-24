import { KeychainApi } from 'src/api/keychain';

export const getPhishingAccounts = async () => {
  return await KeychainApi.get('hive/phishingAccounts');
};
