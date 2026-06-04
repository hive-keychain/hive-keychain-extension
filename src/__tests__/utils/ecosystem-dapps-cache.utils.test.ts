import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { DAppCategory } from 'src/interfaces/ecosystem-dapps.interface';

jest.mock('src/api/keychain', () => ({
  KeychainApi: {
    get: jest.fn(),
  },
}));

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn(),
  },
}));

const loadTestContext = async () => {
  const cacheUtils = await import('src/utils/ecosystem-dapps-cache.utils');
  const { KeychainApi } = await import('src/api/keychain');
  const LocalStorageUtils = (await import('src/utils/localStorage.utils'))
    .default;

  return {
    ...cacheUtils,
    KeychainApi: KeychainApi as { get: jest.Mock },
    LocalStorageUtils: LocalStorageUtils as {
      getValueFromLocalStorage: jest.Mock;
      saveValueInLocalStorage: jest.Mock;
    },
  };
};

describe('ecosystem dapps cache utils', () => {
  const categories: DAppCategory[] = [
    {
      category: 'DeFi',
      dapps: [
        {
          id: 1,
          name: 'Example Dapp',
          description: 'Example',
          icon: 'icon.png',
          url: 'https://example.com',
          chainId: '0x1',
          categories: ['DeFi'],
          order: 1,
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns cached ecosystem dapps without calling the API', async () => {
    const { getCachedEcosystemDapps, KeychainApi, LocalStorageUtils } =
      await loadTestContext();

    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({
      categories,
      fetchedAt: Date.now(),
    });

    await expect(getCachedEcosystemDapps()).resolves.toEqual(categories);
    expect(KeychainApi.get).not.toHaveBeenCalled();
  });

  it('returns an empty list when no ecosystem cache exists', async () => {
    const { getCachedEcosystemDapps, KeychainApi, LocalStorageUtils } =
      await loadTestContext();

    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(undefined);

    await expect(getCachedEcosystemDapps()).resolves.toEqual([]);
    expect(KeychainApi.get).not.toHaveBeenCalled();
  });

  it('waits for the API when popup startup has no cached ecosystem dapps', async () => {
    const {
      getEcosystemCategoriesForPopup,
      KeychainApi,
      LocalStorageUtils,
    } = await loadTestContext();

    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue(undefined);
    KeychainApi.get.mockResolvedValue(categories);

    await expect(getEcosystemCategoriesForPopup()).resolves.toEqual(categories);
    expect(KeychainApi.get).toHaveBeenCalledWith('ecosystem/dapps');
  });

  it('uses cached ecosystem dapps for popup startup without calling the API', async () => {
    const {
      getEcosystemCategoriesForPopup,
      KeychainApi,
      LocalStorageUtils,
    } = await loadTestContext();

    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({
      categories,
      fetchedAt: Date.now(),
    });

    await expect(getEcosystemCategoriesForPopup()).resolves.toEqual(categories);
    expect(KeychainApi.get).not.toHaveBeenCalled();
  });

  it('refreshes stale ecosystem cache through ensureEcosystemDappsCached', async () => {
    const {
      ensureEcosystemDappsCached,
      KeychainApi,
      LocalStorageUtils,
      ECOSYSTEM_DAPPS_TTL_MS,
    } = await loadTestContext();

    LocalStorageUtils.getValueFromLocalStorage.mockResolvedValue({
      categories: [],
      fetchedAt: Date.now() - ECOSYSTEM_DAPPS_TTL_MS - 1,
    });
    KeychainApi.get.mockResolvedValue(categories);

    await expect(ensureEcosystemDappsCached()).resolves.toEqual(categories);
    expect(KeychainApi.get).toHaveBeenCalledWith('ecosystem/dapps');
    expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
      LocalStorageKeyEnum.ECOSYSTEM_DAPPS_CACHE,
      expect.objectContaining({
        categories,
      }),
    );
  });
});
