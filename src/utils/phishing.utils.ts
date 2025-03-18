import { KeychainApi } from '@api/keychain';

const getPhishingAccounts = async () => {
  return await KeychainApi.get('hive/phishingAccounts');
};

const getBlacklistedDomains = async () => {
  return await KeychainApi.get('hive/blacklistedDomains');
};

const PhishingUtils = {
  getPhishingAccounts,
  getBlacklistedDomains,
};

export default PhishingUtils;
