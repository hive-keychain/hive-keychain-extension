// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BaseApi } from 'src/api/base';

const buildUrl = (walletAddress: string, chain: EvmChain, offset: number) => {
  return `${chain.blockExplorer?.url}/api?module=account&action=tokentx&address=${walletAddress}&startblock=0&endblock=99999999&offset=${offset}&sort=asc`;
};

const get = async (
  walletAddress: string,
  chain: EvmChain,
  limit: number,
): Promise<any> => {
  return await BaseApi.get(buildUrl(walletAddress, chain, limit));
};

export const EtherscanApi = {
  get,
};
