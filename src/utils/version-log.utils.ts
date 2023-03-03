import { KeychainApi } from '@api/keychain';

const getLastVersion = async () => {
  const response = await KeychainApi.get('hive/last-extension-version');
  return response;
};

export const VersionLogUtils = {
  getLastVersion,
};
