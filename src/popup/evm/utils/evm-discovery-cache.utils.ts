import {
  DiscoveredNftsResponse,
  DiscoveredTokensResponse,
  evmChainIdToDecimalPathSegment,
} from '@popup/evm/utils/evm-light-node.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export type EvmDiscoveryCacheEntry<T> = {
  updatedAt: number;
  response: T;
};

type EvmDiscoveryCache<T> = Record<
  string,
  Record<string, EvmDiscoveryCacheEntry<T>>
>;

const normalizeChainKey = (chainId: string | number): string =>
  evmChainIdToDecimalPathSegment(chainId).toLowerCase();

const normalizeWalletKey = (walletAddress: string): string =>
  walletAddress.toLowerCase();

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const readCache = async <T>(
  key: LocalStorageKeyEnum,
): Promise<EvmDiscoveryCache<T>> => {
  const raw = await LocalStorageUtils.getValueFromLocalStorage(key);
  return isPlainRecord(raw) ? (raw as EvmDiscoveryCache<T>) : {};
};

const saveCacheEntry = async <T>(
  key: LocalStorageKeyEnum,
  chainId: string | number,
  walletAddress: string,
  response: T,
): Promise<EvmDiscoveryCacheEntry<T>> => {
  const cache = await readCache<T>(key);
  const chainKey = normalizeChainKey(chainId);
  const walletKey = normalizeWalletKey(walletAddress);
  const entry = { updatedAt: Date.now(), response };

  await LocalStorageUtils.saveValueInLocalStorage(key, {
    ...cache,
    [chainKey]: {
      ...(cache[chainKey] ?? {}),
      [walletKey]: entry,
    },
  });

  return entry;
};

const getCacheEntry = async <T>(
  key: LocalStorageKeyEnum,
  chainId: string | number,
  walletAddress: string,
): Promise<EvmDiscoveryCacheEntry<T> | null> => {
  const cache = await readCache<T>(key);
  const chainKey = normalizeChainKey(chainId);
  const walletKey = normalizeWalletKey(walletAddress);
  return cache[chainKey]?.[walletKey] ?? null;
};

const saveDiscoveredTokens = (
  chainId: string | number,
  walletAddress: string,
  response: DiscoveredTokensResponse,
) =>
  saveCacheEntry(
    LocalStorageKeyEnum.EVM_DISCOVERED_TOKENS_CACHE,
    chainId,
    walletAddress,
    response,
  );

const getDiscoveredTokens = (
  chainId: string | number,
  walletAddress: string,
) =>
  getCacheEntry<DiscoveredTokensResponse>(
    LocalStorageKeyEnum.EVM_DISCOVERED_TOKENS_CACHE,
    chainId,
    walletAddress,
  );

const saveDiscoveredNfts = (
  chainId: string | number,
  walletAddress: string,
  response: DiscoveredNftsResponse,
) =>
  saveCacheEntry(
    LocalStorageKeyEnum.EVM_DISCOVERED_NFTS_CACHE,
    chainId,
    walletAddress,
    response,
  );

const getDiscoveredNfts = (chainId: string | number, walletAddress: string) =>
  getCacheEntry<DiscoveredNftsResponse>(
    LocalStorageKeyEnum.EVM_DISCOVERED_NFTS_CACHE,
    chainId,
    walletAddress,
  );

export const EvmDiscoveryCacheUtils = {
  getDiscoveredTokens,
  saveDiscoveredTokens,
  getDiscoveredNfts,
  saveDiscoveredNfts,
};
