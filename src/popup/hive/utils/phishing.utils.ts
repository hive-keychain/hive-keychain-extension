import { KeychainApi } from '@popup/hive/api/keychain';

export const getPhishingAccounts = async () => {
  return await KeychainApi.get('hive/phishingAccounts');
};
