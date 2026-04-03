import { KeychainApi } from '@api/keychain';
import {
  EvmLightNodeContractResponse,
  EvmLightNodeRegisteredAddresses,
} from '@popup/evm/interfaces/evm-light-node.interface';
import {
  EvmLpV2Pair,
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoErc721,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

/** Keychain `evm/light-node/*` routes expect a decimal chain id in the path, not hex (`0x…`). */
export function evmChainIdToDecimalPathSegment(
  chainId: string | number,
): string {
  if (typeof chainId === 'number' && Number.isFinite(chainId)) {
    return String(Math.trunc(chainId));
  }
  const s = String(chainId).trim();
  if (/^0x[0-9a-fA-F]+$/i.test(s)) {
    return BigInt(s).toString();
  }
  const n = Number(s);
  if (Number.isFinite(n)) {
    return String(Math.trunc(n));
  }
  return s;
}

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
      amount: string;
      infinite?: boolean;
      verified: boolean;
      possibleSpam: boolean;
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
      verified: boolean;
      possibleSpam: boolean;
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
  status: 'SUCCESS' | 'REVERTED' | null;
  fromAddress: string | null;
  toAddress: string | null;
  action?: string; // currently always null in DB unless populated elsewhere
};

type HistoryFlow =
  | {
      kind: 'NATIVE';
      amountWei: string;
      amount: string;
      verified: boolean;
      possibleSpam: boolean;
    } // amountWei raw; amount parsed at 18 decimals
  | {
      kind: 'ERC20';
      tokenAddress: string;
      symbol: string | null;
      amount: string;
      infinite?: boolean;
      verified: boolean;
      possibleSpam: boolean;
    } // amountRaw raw; amount parsed with token decimals, fallback 18
  | {
      kind: 'ERC721';
      collectionAddress: string;
      collectionName: string | null;
      tokenId: string;
      quantity: '1';
      verified: boolean;
      possibleSpam: boolean;
    }
  | {
      kind: 'ERC1155';
      collectionAddress: string;
      collectionName: string | null;
      tokenId: string;
      quantity: string;
      verified: boolean;
      possibleSpam: boolean;
    };

export type LightNodeHistoryDetailItem = HistoryDetailItem;
export type LightNodeHistoryFlow = HistoryFlow;
export type LightNodeHistoryFlowWithMeta = HistoryFlowWithMeta;
export type LightNodeHistoryItem = HistoryItem;
export enum CatchupStatus {
  SKIPPED = 'SKIPPED',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
  PARTIAL = 'PARTIAL',
  ERROR = 'ERROR',
}
export enum PricingStatus {
  READY = 'READY',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
}

export type DiscoveredErc20Token = EvmSmartContractInfoErc20 & {
  balance?: string;
  formattedBalance?: string;
  balanceUsd?: string;
  isNativeWrapped?: boolean;
  lpV2?: EvmLpV2Pair;
};

export type DiscoveredToken =
  | EvmSmartContractInfoNative
  | DiscoveredErc20Token
  | EvmSmartContractInfoErc721
  | EvmSmartContractInfoErc1155;

export type DiscoveredTokensResponse = {
  address: string;
  chainId: string;
  tokens: DiscoveredToken[];
  catchupStatus: CatchupStatus;
  pricingStatus: PricingStatus;
};

export type DiscoveredNftsResponse = {
  chainId: number;
  address: string;
  catchupStatus: string | null;
  collections: NftDiscoveryCollectionResponse[];
};

export type NftDiscoveryCollectionResponse = {
  contractAddress: string;
  contractType: 'ERC721' | 'ERC1155' | 'UNKNOWN';
  name: string | null;
  symbol: string | null;
  verifiedContract: boolean;
  possibleSpam: boolean;
  nfts: NftDiscoveryItemResponse[];
};

export type NftDiscoveryItemResponse = {
  tokenId: string;
  balance: string;
  name: string | null;
  imageUrl: string | null;
};

// Done
const getDiscoveredTokens = async (
  chainId: string | number,
  address: string,
): Promise<DiscoveredTokensResponse> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const reponse: DiscoveredTokensResponse = await KeychainApi.get(
    `evm/light-node/discovery/tokens/${id}/${encodeURIComponent(address)}`,
  );

  return reponse;
};

const getDiscoveredNfts = async (
  chainId: string | number,
  address: string,
): Promise<DiscoveredNftsResponse> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response: DiscoveredNftsResponse = await KeychainApi.get(
    `evm/light-node/discovery/nfts/${id}/${encodeURIComponent(address)}`,
  );
  return response;
};

const getNftDetail = async (
  chainId: string | number,
  nftId: string,
): Promise<unknown> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return KeychainApi.get(
    `evm/light-node/nft/detail/${id}/${encodeURIComponent(nftId)}`,
  );
};

const getHistory = async (
  chainId: string | number,
  address: string,
  query: string,
): Promise<{ items: HistoryItem[]; nextCursor: string | null }> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return await KeychainApi.get(
    `evm/light-node/history/${id}/${encodeURIComponent(address)}${
      query && query.length > 0 ? `?${query}` : ''
    }`,
  );
};

const getHistoryDetail = async (
  chainId: string | number,
  txId: string,
): Promise<unknown> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return KeychainApi.get(
    `evm/light-node/history/detail/${id}/${encodeURIComponent(txId)}`,
  );
};

const getContract = async (
  chainId: string | number,
  contractAddress: string,
): Promise<EvmLightNodeContractResponse> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return await KeychainApi.get(
    `evm/light-node/contract/${id}/${encodeURIComponent(contractAddress)}`,
  );
};

const getGasFee = async (chainId: string | number): Promise<unknown> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return KeychainApi.get(`evm/light-node/gas-fee/${id}`);
};

const getPrice = async (
  chainId: string | number,
  tokenAddress?: string,
): Promise<number> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response = await KeychainApi.get(
    `evm/light-node/price/${id}/${tokenAddress ? encodeURIComponent(tokenAddress) : ''}`,
  );
  return response.priceUsd ?? 0;
};

const getAbi = async (chainId: string, contractAddress: string) => {
  const contractInfo = await getContract(chainId, contractAddress);
  if (!contractInfo) {
    return null;
  }

  if (
    contractInfo.isProxy &&
    contractInfo.proxyTarget &&
    contractInfo.proxyTarget.toLowerCase() !== contractAddress.toLowerCase()
  ) {
    const proxyTargetInfo = await getContract(
      chainId,
      contractInfo.proxyTarget,
    );
    return proxyTargetInfo?.abi ?? null;
  }

  return contractInfo.abi;
};

const getMetadata = async (
  chainId: string,
  contractAddress: string,
): Promise<EvmSmartContractInfo> => {
  return {} as EvmSmartContractInfo;
};

const registerAddress = async (
  chainId: string,
  address: string,
  newAddress: boolean,
): Promise<void> => {
  address = process.env.FORCED_EVM_WALLET_ADDRESS ?? address;
  let registeredAddresses: EvmLightNodeRegisteredAddresses =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_LIGHT_NODE_REGISTERED_ADDRESSES,
    );
  if (!registeredAddresses) registeredAddresses = {};
  if (!registeredAddresses[chainId]) registeredAddresses[chainId] = [];
  if (registeredAddresses[chainId].includes(address)) {
    return;
  }
  registeredAddresses[chainId].push(address);

  const id = evmChainIdToDecimalPathSegment(chainId);
  await KeychainApi.get(
    `evm/light-node/register-address/${id}/${encodeURIComponent(address)}/${newAddress}`,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LIGHT_NODE_REGISTERED_ADDRESSES,
    registeredAddresses,
  );
  return;
};

export const EvmLightNodeUtils = {
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
  registerAddress,
};
