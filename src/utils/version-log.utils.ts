import { KeychainApi } from 'src/api/keychain';

const getLastVersion = async () => {
  const response = await KeychainApi.get('last-extension-version');
  return response;
};

export const VersionLogUtils = {
  getLastVersion,
};
