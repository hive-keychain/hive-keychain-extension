import { KeychainApi } from 'src/api/keychain';
import Logger from 'src/utils/logger.utils';

const getDappList = async (chain: string) => {
  try {
    const response = await KeychainApi.get(
      `${chain.toLowerCase()}/ecosystem/dapps`,
    );
    return response;
  } catch (err) {
    Logger.error('Error while fetching dapp list', err);
    return null;
  }
};

export const EcosystemUtils = { getDappList };
