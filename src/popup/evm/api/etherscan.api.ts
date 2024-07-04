// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BaseApi } from 'src/api/base';

const getTokenTx = (walletAddress: string, chain: EvmChain, offset: number) => {
  return get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&offset=${offset}&sort=asc`,
  );
};

const getHistory = (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  return get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999`,
  );
};

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(url);
};

export const EtherscanApi = {
  get,
  getTokenTx,
  getHistory,
};