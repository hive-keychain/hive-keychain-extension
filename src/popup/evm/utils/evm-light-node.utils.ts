import { EvmLightNodeApi } from '@api/evm-light-node';
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

/** Direct light-node routes expect a decimal chain id in the path, not hex (`0x…`). */
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

const normalizeNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length ? normalizedValue : undefined;
};

const normalizeCoingeckoIdFromPayload = (
  payload: unknown,
  keys: string[],
): string | undefined => {
  const directValue = normalizeNonEmptyString(payload);
  if (directValue) {
    return directValue;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = normalizeNonEmptyString(record[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
};

const normalizeProxyTarget = (
  proxyTarget: unknown,
  depth = 0,
): string | null => {
  if (depth > 2 || proxyTarget == null) {
    return null;
  }

  if (typeof proxyTarget === 'string') {
    const normalizedProxyTarget = proxyTarget.trim();
    return normalizedProxyTarget.length ? normalizedProxyTarget : null;
  }

  if (Array.isArray(proxyTarget)) {
    return normalizeProxyTarget(proxyTarget[0], depth + 1);
  }

  if (typeof proxyTarget === 'object') {
    const nestedProxyTarget = proxyTarget as Record<string, unknown>;
    for (const key of ['target', 'proxyTarget', 'address']) {
      if (key in nestedProxyTarget) {
        return normalizeProxyTarget(nestedProxyTarget[key], depth + 1);
      }
    }
  }

  return null;
};

const normalizeContract = (
  contract: EvmLightNodeContractResponse,
): EvmLightNodeContractResponse => ({
  ...contract,
  proxyTarget: normalizeProxyTarget(contract.proxyTarget),
});

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

const buildHistoryQuery = (query: string) => {
  if (!query || query.length === 0) {
    return '';
  }

  const source = new URLSearchParams(query);
  const allowed = new URLSearchParams();
  for (const key of ['cursor', 'limit']) {
    const value = source.get(key);
    if (value != null && value.length > 0) {
      allowed.set(key, value);
    }
  }

  const normalizedQuery = allowed.toString();
  return normalizedQuery ? `?${normalizedQuery}` : '';
};

// Done
const getDiscoveredTokens = async (
  chainId: string | number,
  address: string,
): Promise<DiscoveredTokensResponse> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const reponse: DiscoveredTokensResponse = await EvmLightNodeApi.get(
    `discovery/tokens/${id}/${encodeURIComponent(address)}`,
  );

  return reponse;
};

const getDiscoveredNfts = async (
  chainId: string | number,
  address: string,
): Promise<DiscoveredNftsResponse> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response: DiscoveredNftsResponse = await EvmLightNodeApi.get(
    `discovery/nfts/${id}/${encodeURIComponent(address)}`,
  );
  return response;
};

const getNftDetail = async (
  collectionAddress: string,
  tokenId: string,
): Promise<unknown> => {
  return EvmLightNodeApi.get(
    `nft/detail/${encodeURIComponent(collectionAddress)}/${encodeURIComponent(
      tokenId,
    )}`,
  );
};

const getHistory = async (
  chainId: string | number,
  address: string,
  query: string,
): Promise<{ items: HistoryItem[]; nextCursor: string | null }> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return await EvmLightNodeApi.get(
    `history/${id}/${encodeURIComponent(address)}${buildHistoryQuery(query)}`,
  );
};

const getHistoryDetail = async (
  chainId: string | number,
  txId: string,
): Promise<unknown> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return EvmLightNodeApi.get(
    `history/detail/${id}/${encodeURIComponent(txId)}`,
  );
};

const getContract = async (
  chainId: string | number,
  contractAddress: string,
): Promise<EvmLightNodeContractResponse> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response = await EvmLightNodeApi.get(
    `contract/${id}/${encodeURIComponent(contractAddress)}`,
  );
  return normalizeContract(response as EvmLightNodeContractResponse);
};

const getGasFee = async (chainId: string | number): Promise<unknown> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  return EvmLightNodeApi.get(`gas-oracle/${id}`);
};

const getCoingeckoNativeCoinId = async (
  chainId: string | number,
): Promise<string | undefined> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response = await EvmLightNodeApi.get(`coingecko/${id}`);
  return normalizeCoingeckoIdFromPayload(response, [
    'native_coin_id',
    'nativeCoinId',
    'coingeckoId',
  ]);
};

const getCoingeckoTokenId = async (
  chainId: string | number,
  tokenAddress: string,
): Promise<string | undefined> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response = await EvmLightNodeApi.get(
    `coingecko/${id}/${encodeURIComponent(tokenAddress)}`,
  );
  return normalizeCoingeckoIdFromPayload(response, [
    'coingeckoId',
    'coingecko_id',
  ]);
};

const getPrice = async (
  chainId: string | number,
  tokenAddress?: string,
): Promise<number> => {
  const id = evmChainIdToDecimalPathSegment(chainId);
  const response = await EvmLightNodeApi.get(
    tokenAddress
      ? `price/${id}/${encodeURIComponent(tokenAddress)}`
      : `price/${id}`,
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
    // TODO remove after testing period
    // return;
  }
  registeredAddresses[chainId].push(address);

  const id = evmChainIdToDecimalPathSegment(chainId);
  await EvmLightNodeApi.post(
    `register/${id}/${encodeURIComponent(address)}/${newAddress}`,
    {},
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
  getCoingeckoNativeCoinId,
  getCoingeckoTokenId,
  getPrice,
  getAbi,
  getMetadata,
  registerAddress,
};
