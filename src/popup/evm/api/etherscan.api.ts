// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BaseApi } from 'src/api/base';

const discoverTokens = async (walletAddress: string, chain: EvmChain) => {
  const response = await get(`
    ${chain.blockExplorerApi?.url}/api?module=account&action=tokenlist&address=${walletAddress}
  `);

  return response.result ?? [];
};

const getErc721TokenTransactions = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const response = await get(`
    ${chain.blockExplorerApi?.url}/api?module=account&action=tokennfttx&address=${walletAddress}&page=${page}&offset=${offset}&sort=desc
    `);
  return response.result ?? [];
};

const getInternalsTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const response = await get(`
    ${chain.blockExplorerApi?.url}/api?module=account&action=txlistinternal&address=${walletAddress}&page=${page}&offset=${offset}&sort=desc
    `);
  return response.result ?? [];
};

const getTokenTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const response = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=tokentx&address=${walletAddress}&page=${page}&offset=${offset}&sort=desc`,
  );
  return response.result ?? [];
};

const getHistory = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const response = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=txlist&address=${walletAddress}&sort=desc&page=${page}&offset=${offset}`,
  );
  return response.result ?? [];
};

const getAbi = async (chain: EvmChain, address: string) => {
  const res = await get(
    `${chain.blockExplorerApi?.url}/api?module=contract&action=getabi&address=${address}`,
  );
  if (res.status === '1') {
    return res.result;
  }
  return null;
};

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(url);
};

export const EtherscanApi = {
  get,
  getTokenTx,
  getHistory,
  getInternalsTx,
  getAbi,
  discoverTokens,
  getErc721TokenTransactions,
};
