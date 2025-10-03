// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BaseApi } from 'src/api/base';
import Logger from 'src/utils/logger.utils';

const discoverTokens = async (walletAddress: string, chain: EvmChain) => {
  const result = await get(`
    ${chain.blockExplorerApi?.url}/api?module=account&action=tokenlist&address=${walletAddress}
  `);
  console.log(result, 'result in discoverTokens');
  return result
    ? result.map((r: any) => ({ ...r, type: r.type.replace('-', '') }))
    : [];
};

const getNftTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await get(`
    ${chain.blockExplorerApi?.url}/api?module=account&action=tokennfttx&address=${walletAddress}&page=${page}&offset=${offset}&sort=desc
    `);
  return result ?? [];
};

const getInternalsTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await get(`
    ${chain.blockExplorerApi?.url}/api?module=account&action=txlistinternal&address=${walletAddress}&page=${page}&offset=${offset}&sort=desc
    `);
  return result ?? [];
};

const getTokenTx = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=tokentx&address=${walletAddress}&page=${page}&offset=${offset}&sort=desc`,
  );
  return result ?? [];
};

const getHistory = async (
  walletAddress: string,
  chain: EvmChain,
  page: number,
  offset: number,
) => {
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=txlist&address=${walletAddress}&sort=desc&page=${page}&offset=${offset}`,
  );
  return result ?? [];
};

const getAbi = async (chain: EvmChain, address: string) => {
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=contract&action=getabi&address=${address}`,
  );
  return result;
};

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

const getPendingTransactions = async (chain: EvmChain, address: string) => {
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=pendingtxlist&address=${address}&page=1&offset=50`,
  );
  return result;
};

export const BlockscoutApi = {
  get,
  getTokenTx,
  getHistory,
  getInternalsTx,
  getAbi,
  discoverTokens,
  getNftTx,
  getPendingTransactions,
};
