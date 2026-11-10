import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { PortfolioAvailableAssetsResponse } from 'src/portfolio/portfolio-api.interface';
import { PortfolioApiParser } from 'src/portfolio/portfolio-api.parser';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const PORTFOLIO_SWAP_CATALOG_TTL_MS = 60 * 60 * 1000;
const PORTFOLIO_SWAP_CATALOG_CACHE_VERSION = 1;
const BASE64_CHUNK_SIZE = 32_768;

export interface PortfolioSwapCatalogCachePayload {
  response: PortfolioAvailableAssetsResponse;
  fetchedAt: number;
}

interface StoredPortfolioSwapCatalogCachePayload {
  version: typeof PORTFOLIO_SWAP_CATALOG_CACHE_VERSION;
  encoding: 'gzip-base64';
  compressedResponse: string;
  fetchedAt: number;
  assetCount: number;
}

let refreshPromise: Promise<PortfolioAvailableAssetsResponse> | null = null;

const parseSwapCatalogResponse = (
  value: unknown,
): PortfolioAvailableAssetsResponse | null => {
  const response = PortfolioApiParser.parsePortfolioAvailableAssetsResponse(
    value,
  );
  if (
    response.mode !== 'swap' ||
    response.direction !== null ||
    response.sourceAssetId !== null ||
    response.assets.length === 0
  ) {
    return null;
  }

  return response;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + BASE64_CHUNK_SIZE),
    );
  }
  return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const readByteStream = async (
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    totalLength += value.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

const transformBytes = async (
  input: Uint8Array,
  transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array> => {
  const outputPromise = readByteStream(transform.readable);
  const writer = transform.writable.getWriter();
  await writer.write(input);
  await writer.close();
  return outputPromise;
};

const compressSwapCatalogResponse = async (
  response: PortfolioAvailableAssetsResponse,
): Promise<string> => {
  const input = new TextEncoder().encode(JSON.stringify(response));
  const compressed = await transformBytes(
    input,
    new CompressionStream('gzip'),
  );
  return bytesToBase64(compressed);
};

const decompressSwapCatalogResponse = async (
  compressedResponse: string,
): Promise<unknown> => {
  const compressed = base64ToBytes(compressedResponse);
  const decompressed = await transformBytes(
    compressed,
    new DecompressionStream('gzip'),
  );
  return JSON.parse(new TextDecoder().decode(decompressed));
};

const parseCachePayload = async (
  value: unknown,
): Promise<PortfolioSwapCatalogCachePayload | null> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const payload = value as Partial<
    PortfolioSwapCatalogCachePayload & StoredPortfolioSwapCatalogCachePayload
  >;
  if (
    typeof payload.fetchedAt !== 'number' ||
    !Number.isFinite(payload.fetchedAt)
  ) {
    return null;
  }

  let responseValue: unknown = payload.response;
  if (
    payload.version === PORTFOLIO_SWAP_CATALOG_CACHE_VERSION &&
    payload.encoding === 'gzip-base64' &&
    typeof payload.compressedResponse === 'string'
  ) {
    try {
      responseValue = await decompressSwapCatalogResponse(
        payload.compressedResponse,
      );
    } catch {
      return null;
    }
  }

  const response = parseSwapCatalogResponse(responseValue);
  if (!response) {
    return null;
  }

  return { response, fetchedAt: payload.fetchedAt };
};

const getCachedSwapCatalog = async (): Promise<
  PortfolioSwapCatalogCachePayload | null
> => {
  const cached = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.PORTFOLIO_SWAP_CATALOG_CACHE,
  );
  return parseCachePayload(cached);
};

const isSwapCatalogCacheFresh = (
  payload: PortfolioSwapCatalogCachePayload,
): boolean => {
  const age = Date.now() - payload.fetchedAt;
  return age >= 0 && age < PORTFOLIO_SWAP_CATALOG_TTL_MS;
};

const refreshSwapCatalog = (): Promise<PortfolioAvailableAssetsResponse> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const requestPromise = PortfolioApiUtils.listAvailableAssets({ mode: 'swap' })
    .then(async (response) => {
      const validResponse = parseSwapCatalogResponse(response);
      if (!validResponse) {
        const cached = await getCachedSwapCatalog();
        const emptyResponse: PortfolioAvailableAssetsResponse = {
          ...response,
          mode: 'swap',
          direction: null,
          sourceAssetId: null,
          assets: [],
        };
        return cached?.response ?? emptyResponse;
      }

      try {
        const payload: StoredPortfolioSwapCatalogCachePayload = {
          version: PORTFOLIO_SWAP_CATALOG_CACHE_VERSION,
          encoding: 'gzip-base64',
          compressedResponse:
            await compressSwapCatalogResponse(validResponse),
          fetchedAt: Date.now(),
          assetCount: validResponse.assets.length,
        };
        await LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.PORTFOLIO_SWAP_CATALOG_CACHE,
          payload,
        );
      } catch (error) {
        Logger.error('Unable to cache portfolio swap catalog', error);
      }
      return validResponse;
    })
    .finally(() => {
      refreshPromise = null;
    });

  refreshPromise = requestPromise;
  return requestPromise;
};

const ensureSwapCatalogCached = async (): Promise<
  PortfolioAvailableAssetsResponse
> => {
  const cached = await getCachedSwapCatalog();
  if (cached && isSwapCatalogCacheFresh(cached)) {
    return cached.response;
  }

  return refreshSwapCatalog();
};

export const PortfolioSwapCatalogCacheUtils = {
  PORTFOLIO_SWAP_CATALOG_TTL_MS,
  ensureSwapCatalogCached,
  getCachedSwapCatalog,
  isSwapCatalogCacheFresh,
  refreshSwapCatalog,
};
