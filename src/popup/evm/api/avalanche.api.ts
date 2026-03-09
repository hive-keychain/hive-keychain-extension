import { BaseApi } from '@api/base';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Logger from 'src/utils/logger.utils';

const get = async (url: string): Promise<any> => {
  try {
    return await BaseApi.get(url);
  } catch (err) {
    Logger.error(err);
    return null;
  }
};

const getPendingTransactions = async (chain: EvmChain, address: string) => {
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=pendingtxlist&address=${address}&page=1&offset=50`,
  );
  return result;
};

export const AvalancheApi = {
  getPendingTransactions,
};
