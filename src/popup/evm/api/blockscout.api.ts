import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BaseApi } from 'src/api/base';
import Logger from 'src/utils/logger.utils';

const get = async (url: string): Promise<any> => {
  try {
    const res = await BaseApi.get(url);
    if (res && res.status === '1') {
      return res.result;
    } else {
      return null;
    }
  } catch (err) {
    Logger.error(err);
    return null;
  }
};
const getV2 = async (url: string): Promise<any> => {
  try {
    const res = await BaseApi.get(url);
    return res;
  } catch (err) {
    Logger.error(err);
    return null;
  }
};

const getPendingTransactions = async (chain: EvmChain, address: string) => {
  const res = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=pendingtxlist&address=${address}&page=1&offset=50`,
  );
  return res;
};

export const BlockscoutApi = {
  get,
  getPendingTransactions,
  getV2,
};
