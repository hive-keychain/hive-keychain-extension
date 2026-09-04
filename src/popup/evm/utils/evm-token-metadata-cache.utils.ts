import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ethers } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const EVM_TOKEN_METADATA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface RpcTokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

interface CachedMetadataField<T extends keyof RpcTokenMetadata> {
  value: RpcTokenMetadata[T];
  fetchedAt: number;
}

// Each key includes the field, so overlapping lookups share that field's RPC call.
const metadataInflight = new Map<string, Promise<string | number>>();

const isFreshMetadataField = <T extends keyof RpcTokenMetadata>(
  field: T,
  raw: unknown,
): raw is CachedMetadataField<T> => {
  if (!raw || typeof raw !== 'object') return false;
  const entry = raw as Partial<CachedMetadataField<T>>;
  if (
    typeof entry.fetchedAt !== 'number' ||
    !Number.isFinite(entry.fetchedAt) ||
    entry.fetchedAt > Date.now() ||
    Date.now() - entry.fetchedAt >= EVM_TOKEN_METADATA_CACHE_TTL_MS
  ) {
    return false;
  }
  return field === 'decimals'
    ? typeof entry.value === 'number' &&
        Number.isInteger(entry.value) &&
        entry.value >= 0 &&
        entry.value <= 255
    : typeof entry.value === 'string' && entry.value.trim().length > 0;
};

const getField = <T extends keyof RpcTokenMetadata>(
  chainId: string,
  address: string,
  field: T,
  fetchValue: () => Promise<RpcTokenMetadata[T]>,
): Promise<RpcTokenMetadata[T]> => {
  const key = `${LocalStorageKeyEnum.EVM_RPC_TOKEN_METADATA}:${ethers.toQuantity(
    chainId,
  )}:${address.toLowerCase()}:${field}` as const;
  const pending = metadataInflight.get(key);
  // The normalized key includes T; this promise can only resolve to that field.
  if (pending) return pending as Promise<RpcTokenMetadata[T]>;

  const lookup = async (): Promise<RpcTokenMetadata[T]> => {
    try {
      const cached: unknown =
        await LocalStorageUtils.getValueFromLocalStorage(key);
      if (isFreshMetadataField(field, cached)) return cached.value;
    } catch {
      Logger.warn('ERC20 metadata cache read failed; using RPC');
    }

    const value = await fetchValue();
    const entry: CachedMetadataField<T> = { value, fetchedAt: Date.now() };
    if (isFreshMetadataField(field, entry)) {
      try {
        // Separate storage keys prevent concurrent field/token writes losing data.
        await LocalStorageUtils.saveValueInLocalStorage(key, entry);
      } catch {
        Logger.warn('ERC20 metadata cache write failed; using RPC result');
      }
    }
    return value;
  };

  const result = lookup().finally(() => metadataInflight.delete(key));
  metadataInflight.set(key, result);
  return result;
};

export const EvmTokenMetadataCacheUtils = { getField };
