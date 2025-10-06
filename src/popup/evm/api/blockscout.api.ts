// https://gas.api.cx.metamask.io/networks/43114/suggestedGasFees

import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { BaseApi } from 'src/api/base';
import Logger from 'src/utils/logger.utils';

const BLOCKSCOUT_NFT_TYPE = {
  [EVMSmartContractType.ERC721]: 'ERC-721',
  [EVMSmartContractType.ERC1155]: 'ERC-1155',
};

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
  const result = await get(
    `${chain.blockExplorerApi?.url}/api?module=account&action=pendingtxlist&address=${address}&page=1&offset=50`,
  );
  return result;
};

const getNftList = async (
  chain: EvmChain,
  walletAddress: string,
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155,
): Promise<any[]> => {
  const res = await fetchNftList(chain, walletAddress, type);
  return res.map((item: any) => {
    return {
      ...item,
      token: {
        ...item.token,
        type: item.token.type.replace('-', ''),
        contractAddress: item.token.address_hash,
      },
      tokensInstances: item.token_instances.map((token: any) => {
        return {
          ...token,
          image: token.image_url,
          metadata: token.metadata
            ? {
                ...token.metadata,
                image: token.metadata.image_url ?? token.metadata.image,
              }
            : null,
        };
      }),
    };
  });
};

const fetchNftList = async (
  chain: EvmChain,
  walletAddress: string,
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155,
  nextTokenContractAddressHash?: string,
): Promise<any> => {
  const res = await getV2(
    `${
      chain.blockExplorerApi?.url
    }/api/v2/addresses/${walletAddress}/nft/collections?type=${
      BLOCKSCOUT_NFT_TYPE[type]
    }${
      nextTokenContractAddressHash
        ? `&token_contract_address_hash=${nextTokenContractAddressHash}`
        : ''
    }`,
  );
  if (
    res.next_page_params?.token_contract_address_hash ===
    nextTokenContractAddressHash
  ) {
    return [];
  }
  return [
    ...res.items,
    ...(await fetchNftList(
      chain,
      walletAddress,
      type,
      res.next_page_params.token_contract_address_hash,
    )),
  ];
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
  getNftList,
  getV2,
};
