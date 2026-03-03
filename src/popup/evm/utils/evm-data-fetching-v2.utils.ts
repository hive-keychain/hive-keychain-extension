import { KeychainApi } from '@api/keychain';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc721,
} from '@popup/evm/interfaces/evm-tokens.interface';

type HistoryDetailItem = {
  txId: string;
  blockNumber: number;
  blockTime: string; // ISO
  opIndex: string;
  opName: string;

  in: HistoryFlowWithMeta[];
  out: HistoryFlowWithMeta[];

  fromAddress: string | null;
  toAddress: string | null;
  action?: string;

  txStatus: 'SUCCESS' | 'REVERTED' | null;
  feeWei: string | null;
  gasUsed: string | null;
  effectiveGasPrice: string | null;
  status: number; // numeric status from operations row
};

type HistoryFlowWithMeta =
  | HistoryFlow
  | {
      kind: 'ERC20';
      tokenAddress: string;
      symbol: string | null;
      amountRaw: string;
      amount: string;
      token?: {
        name: string | null;
        decimals: number | null;
        logoUrl: string | null;
      };
    }
  | {
      kind: 'ERC721' | 'ERC1155';
      collectionAddress: string;
      collectionName: string | null;
      tokenId: string;
      quantity: string;
      collection?: {
        name: string | null;
        symbol: string | null;
        verifiedContract: boolean;
        possibleSpam: boolean;
      };
      nft?: {
        name: string | null;
        imageUrl: string | null;
        traits: Record<string, unknown> | null;
      };
    };

type HistoryItem = {
  txId: string;
  blockNumber: number;
  blockTime: string; // ISO
  opIndex: string; // bigint as string
  opName: string; // derived from OpType enum key
  in: HistoryFlow[];
  out: HistoryFlow[];
  fromAddress: string | null;
  toAddress: string | null;
  action?: string; // currently always null in DB unless populated elsewhere
};

type HistoryFlow =
  | { kind: 'NATIVE'; amountWei: string; amount: string } // amountWei raw; amount parsed at 18 decimals
  | {
      kind: 'ERC20';
      tokenAddress: string;
      symbol: string | null;
      amountRaw: string;
      amount: string;
    } // amountRaw raw; amount parsed with token decimals, fallback 18
  | {
      kind: 'ERC721';
      collectionAddress: string;
      collectionName: string | null;
      tokenId: string;
      quantity: '1';
    }
  | {
      kind: 'ERC1155';
      collectionAddress: string;
      collectionName: string | null;
      tokenId: string;
      quantity: string;
    };

export type LightNodeHistoryDetailItem = HistoryDetailItem;
export type LightNodeHistoryFlow = HistoryFlow;
export type LightNodeHistoryFlowWithMeta = HistoryFlowWithMeta;
export type LightNodeHistoryItem = HistoryItem;

// Done
const getDiscoveredTokens = async (
  chainId: string | number,
  address: string,
  isNew?: boolean,
): Promise<EvmSmartContractInfo[]> => {
  const suffix = isNew === undefined ? '' : `/${isNew}`;
  const tokens: EvmSmartContractInfo[] = await KeychainApi.get(
    `evm/light-node/discovery/tokens/${chainId}/${encodeURIComponent(
      address,
    )}${suffix}`,
  );

  console.log('response', tokens);

  return tokens;
};

const getDiscoveredNfts = async (
  chainId: string | number,
  address: string,
): Promise<(EvmSmartContractInfoErc721 | EvmSmartContractInfoErc1155)[]> => {
  const nfts: (EvmSmartContractInfoErc721 | EvmSmartContractInfoErc1155)[] =
    await KeychainApi.get(
      `evm/light-node/discovery/nfts/${chainId}/${encodeURIComponent(address)}`,
    );
  console.log('response', nfts);
  return nfts;
};

const getNftDetail = async (
  chainId: string | number,
  nftId: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/nft/detail/${chainId}/${encodeURIComponent(nftId)}`,
  );
};

const getHistory = async (
  chainId: string | number,
  address: string,
  query: string,
): Promise<{ items: HistoryItem[]; cursor: string | null }> => {
  return await KeychainApi.get(
    `evm/light-node/history/${chainId}/${encodeURIComponent(address)}${
      query && query.length > 0 ? `?${query}` : ''
    }`,
  );
};

const getHistoryDetail = async (
  chainId: string | number,
  txId: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/history/detail/${chainId}/${encodeURIComponent(txId)}`,
  );
};

const getContract = async (
  chainId: string | number,
  contractAddress: string,
): Promise<any> => {
  return KeychainApi.get(
    `evm/light-node/contract/${chainId}/${encodeURIComponent(contractAddress)}`,
  );
};

const getGasFee = async (chainId: string | number): Promise<unknown> => {
  return KeychainApi.get(`evm/light-node/gas-fee/${chainId}`);
};

const getPrice = async (
  chainId: string | number,
  tokenAddress: string,
): Promise<unknown> => {
  return KeychainApi.get(
    `evm/light-node/price/${chainId}/${encodeURIComponent(tokenAddress)}`,
  );
};

const getAbi = async (chainId: string, contractAddress: string) => {
  const contractInfo = await getContract(chainId, contractAddress);
  if (contractInfo) {
    return contractInfo.abi;
  }
  return null;
};

const getMetadata = async (
  chainId: string,
  contractAddress: string,
): Promise<EvmSmartContractInfo> => {
  return {} as EvmSmartContractInfo;
};

export const EvmDataFetchingV2Utils = {
  getDiscoveredTokens,
  getDiscoveredNfts,
  getNftDetail,
  getHistory,
  getHistoryDetail,
  getContract,
  getGasFee,
  getPrice,
  getAbi,
  getMetadata,
};
