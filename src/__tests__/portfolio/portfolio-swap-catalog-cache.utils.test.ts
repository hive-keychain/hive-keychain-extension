import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { PortfolioAvailableAssetsResponse } from 'src/portfolio/portfolio-api.interface';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';
import { PortfolioSwapCatalogCacheUtils } from 'src/portfolio/portfolio-swap-catalog-cache.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const {
  CompressionStream: NodeCompressionStream,
  DecompressionStream: NodeDecompressionStream,
} = jest.requireActual('stream/web');

Object.assign(globalThis, {
  CompressionStream: NodeCompressionStream,
  DecompressionStream: NodeDecompressionStream,
});

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));

jest.mock('src/portfolio/portfolio-api.utils', () => ({
  PortfolioApiUtils: {
    listAvailableAssets: jest.fn(),
  },
}));

const swapCatalog: PortfolioAvailableAssetsResponse = {
  mode: 'swap',
  direction: null,
  sourceAssetId: null,
  assets: [
    {
      assetId: 'evm:native:ethereum',
      ecosystem: 'evm',
      symbol: 'ETH',
      name: 'Ethereum',
      chainId: '0x1',
      address: null,
      decimals: 18,
      isNative: true,
      familyId: 'eth',
      logoUrl: null,
      priceUsd: 0,
      rankScore: 1,
    },
  ],
  chains: {},
};

describe('PortfolioSwapCatalogCacheUtils', () => {
  const now = Date.UTC(2026, 7, 18, 12);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    (LocalStorageUtils.saveValueInLocalStorage as jest.Mock).mockResolvedValue(
      undefined,
    );
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue(
      swapCatalog,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a fresh cache without requesting the catalog', async () => {
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue({
      response: swapCatalog,
      fetchedAt: now - 1000,
    });

    await expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached(),
    ).resolves.toEqual(swapCatalog);
    expect(PortfolioApiUtils.listAvailableAssets).not.toHaveBeenCalled();
  });

  it('refreshes and replaces a stale cache', async () => {
    const refreshedCatalog = {
      ...swapCatalog,
      assets: [{ ...swapCatalog.assets[0], rankScore: 2 }],
    };
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue({
      response: swapCatalog,
      fetchedAt:
        now - PortfolioSwapCatalogCacheUtils.PORTFOLIO_SWAP_CATALOG_TTL_MS - 1,
    });
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue(
      refreshedCatalog,
    );

    await expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached(),
    ).resolves.toEqual(refreshedCatalog);
    const storedPayload = (
      LocalStorageUtils.saveValueInLocalStorage as jest.Mock
    ).mock.calls[0][1];
    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.PORTFOLIO_SWAP_CATALOG_CACHE,
      expect.objectContaining({
        version: 1,
        encoding: 'gzip-base64',
        compressedResponse: expect.any(String),
        fetchedAt: now,
        assetCount: 1,
      }),
    );
    expect(storedPayload).not.toHaveProperty('response');

    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      storedPayload,
    );
    await expect(
      PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog(),
    ).resolves.toEqual({ response: refreshedCatalog, fetchedAt: now });
  });

  it('requests and stores the catalog when the cache is missing', async () => {
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      undefined,
    );

    await expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached(),
    ).resolves.toEqual(swapCatalog);
    expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledWith({
      mode: 'swap',
    });
    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalled();
  });

  it('returns the live catalog when persistent caching fails', async () => {
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      undefined,
    );
    (LocalStorageUtils.saveValueInLocalStorage as jest.Mock).mockRejectedValue(
      new Error('QUOTA_BYTES exceeded'),
    );

    await expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached(),
    ).resolves.toEqual(swapCatalog);
  });

  it('ignores malformed cached payloads', async () => {
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue({
      response: { mode: 'swap', assets: [{ invalid: true }] },
      fetchedAt: 'not-a-number',
    });

    await expect(
      PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog(),
    ).resolves.toBeNull();
  });

  it('retains a stale valid cache when a refresh is empty', async () => {
    const stalePayload = {
      response: swapCatalog,
      fetchedAt:
        now - PortfolioSwapCatalogCacheUtils.PORTFOLIO_SWAP_CATALOG_TTL_MS - 1,
    };
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      stalePayload,
    );
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockResolvedValue({
      ...swapCatalog,
      assets: [],
    });

    await expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached(),
    ).resolves.toEqual(swapCatalog);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
  });

  it('leaves a valid cache untouched when refresh fails', async () => {
    const stalePayload = {
      response: swapCatalog,
      fetchedAt:
        now - PortfolioSwapCatalogCacheUtils.PORTFOLIO_SWAP_CATALOG_TTL_MS - 1,
    };
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      stalePayload,
    );
    (PortfolioApiUtils.listAvailableAssets as jest.Mock).mockRejectedValue(
      new Error('offline'),
    );

    await expect(
      PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached(),
    ).rejects.toThrow('offline');
    await expect(
      PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog(),
    ).resolves.toEqual(stalePayload);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
  });

  it('treats the exact one-hour boundary as stale', async () => {
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue({
      response: swapCatalog,
      fetchedAt:
        now - PortfolioSwapCatalogCacheUtils.PORTFOLIO_SWAP_CATALOG_TTL_MS,
    });

    await PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached();
    expect(PortfolioApiUtils.listAvailableAssets).toHaveBeenCalledTimes(1);
  });

  it('keeps the public catalog available across a simulated wallet lock', async () => {
    const cachedPayload = { response: swapCatalog, fetchedAt: now };
    (LocalStorageUtils.getValueFromLocalStorage as jest.Mock).mockResolvedValue(
      cachedPayload,
    );

    await PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog();
    await PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog();

    expect(LocalStorageUtils.getValueFromLocalStorage).toHaveBeenCalledTimes(2);
    expect(LocalStorageUtils.saveValueInLocalStorage).not.toHaveBeenCalled();
  });
});
