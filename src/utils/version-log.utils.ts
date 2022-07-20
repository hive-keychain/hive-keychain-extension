import KeychainApi from '@api/keychain';

const getLastVersion = async () => {
  const response = await KeychainApi.get('/hive/last-extension-version');
  return response.data;
};

export const VersionLogUtils = {
  getLastVersion,
};
