import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainApi } from 'src/api/keychain';
import { DApp, DAppCategory } from 'src/interfaces/ecosystem-dapps.interface';
import { getOriginFromUrl } from 'src/utils/browser-origin.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const ECOSYSTEM_DAPPS_TTL_MS = 60 * 60 * 1000;

export interface EcosystemDappsCachePayload {
  categories: DAppCategory[];
  fetchedAt: number;
}

const isValidPayload = (
  value: unknown,
): value is EcosystemDappsCachePayload => {
  if (!value || typeof value !== 'object') return false;
  const v = value as EcosystemDappsCachePayload;
  return (
    Array.isArray(v.categories) &&
    typeof v.fetchedAt === 'number' &&
    Number.isFinite(v.fetchedAt)
  );
};

const isFresh = (payload: EcosystemDappsCachePayload): boolean => {
  return Date.now() - payload.fetchedAt < ECOSYSTEM_DAPPS_TTL_MS;
};

const readCachePayload =
  async (): Promise<EcosystemDappsCachePayload | null> => {
    const raw = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.ECOSYSTEM_DAPPS_CACHE,
    );
    if (!isValidPayload(raw)) return null;
    return raw;
  };

/**
 * Ensures ecosystem dapps are cached in local storage with a 1h TTL.
 * On network failure, keeps existing cache if any.
 */
export const ensureEcosystemDappsCached = async (): Promise<DAppCategory[]> => {
  const existing = await readCachePayload();
  if (existing && isFresh(existing)) {
    return existing.categories;
  }

  try {
    const response = (await KeychainApi.get(
      'ecosystem/dapps',
    )) as DAppCategory[];

    const categories = Array.isArray(response) ? response : [];
    const next: EcosystemDappsCachePayload = {
      categories,
      fetchedAt: Date.now(),
    };
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.ECOSYSTEM_DAPPS_CACHE,
      next,
    );
    return categories;
  } catch (err) {
    Logger.error('Error while caching ecosystem dapp list', err);
    return existing?.categories ?? [];
  }
};

export const findDappByTabOrigin = (
  categories: DAppCategory[],
  tabOrigin: string | null,
): DApp | null => {
  if (!tabOrigin) return null;

  for (const category of categories ?? []) {
    for (const dapp of category.dapps ?? []) {
      const dappOrigin = getOriginFromUrl(dapp.url);
      if (dappOrigin && dappOrigin === tabOrigin) {
        return dapp;
      }
    }
  }
  return null;
};

export const getActiveTabOrigin = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url;
        resolve(getOriginFromUrl(url ?? undefined));
      });
    } catch {
      resolve(null);
    }
  });
};
